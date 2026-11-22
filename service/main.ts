import http from 'node:http';
import { createHash, createPrivateKey, generateKeyPairSync, randomBytes, sign } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { decryptSpadeA, isHexKey, decryptAudioBuffer } from './decrypt';

// 汽水音乐 anonymous access through the car ("车机") SDK protocol.
const COMMON: Record<string, string> = {
  aid: '765213',
  app_id: '765213',
  app_name: 'byte_autoservice_lite',
  version_code: '100010',
  version_name: '1.0.10',
  channel: 'bydSong',
  sdk_aid: '753999',
  caller_name: 'luna_open_sdk',
  sdk_version_code: '100000100',
  sdk_version_name: '0.0.1',
  sdk_channel: 'Test',
  vehicle_type: 'BYD',
  device_brand: 'BYD',
  device_type: 'BYD',
  device_platform: 'android',
  resolution: '1920x1080',
  os_version: '13',
  ac: 'wifi',
};
const DEVICE_ID = '1234567890123456789';
const UA = 'LunaOpenSDK/1.0.10';
const PREFIX = '/api/luna/v1/platform';

const params = (deviceId = DEVICE_ID): string => {
  const query = new URLSearchParams({
    ...COMMON,
    device_id: deviceId,
    did: deviceId,
    iid: deviceId,
    vehicle_id: `qishui-${deviceId}`,
    _timestamp: String(Math.floor(Date.now() / 1000)),
    _nonce: String(Math.floor(Math.random() * 1e6)),
  });
  return query.toString();
};

let token = '';
let tokenAt = 0;
const clientToken = async (): Promise<string> => {
  if (token && Date.now() - tokenAt < 10 * 60 * 1000) return token;
  const res = await fetch(`https://open.qishui.com${PREFIX}/client/token/get/?trigger_type=cold_start&${params()}`, { headers: { 'user-agent': UA } });
  const body = (await res.json()) as { client_token?: string };
  if (!body.client_token) throw new Error('汽水取 token 失败');
  token = body.client_token;
  tokenAt = Date.now();
  return token;
};

const platformPost = async (path: string, payload: Record<string, unknown>, session: Session | null): Promise<any> => {
  const res = await fetch(`https://open.douyin.com${PREFIX}${path}/?${params(session?.deviceId ?? DEVICE_ID)}`, {
    method: 'POST',
    headers: { 'user-agent': UA, 'content-type': 'application/json', 'access-token': await clientToken() },
    // 会员曲要 common_params.user_id 才会返回 player_info.full，匿名时给空对象。
    body: JSON.stringify({ ...payload, common_params: session ? { user_id: session.user.id } : {} }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`汽水接口 ${res.status}`);
  const body = JSON.parse(text);
  const code = body?.err_no ?? body?.data?.error_code ?? 0;
  if (code) {
    token = '';
    throw new Error(`汽水接口返回 ${code}: ${body?.err_msg ?? ''}`);
  }
  return body;
};

// ---------------------------------------------------------------- 登录态存储

type User = { id: string; nickname: string; isVip: boolean };
type Session = {
  accessCode: string;
  openId: string;
  ticket: string;
  ts_sign: string;
  client_cert: string;
  client_csr: string;
  privateKeyPem: string;
  deviceId: string;
  expiresAt: number | null;
  user: User;
};

const AUTH_DIR = join(homedir(), '.qishui-card');
const SESSION_FILE = join(AUTH_DIR, 'session.json');

const readSession = (): Session | null => {
  try {
    const parsed = JSON.parse(readFileSync(SESSION_FILE, 'utf8')) as Partial<Session>;
    if (!parsed?.ticket || !parsed?.ts_sign || !parsed?.privateKeyPem || !parsed?.user?.id) return null;
    return {
      accessCode: String(parsed.accessCode ?? ''),
      openId: String(parsed.openId ?? ''),
      ticket: String(parsed.ticket),
      ts_sign: String(parsed.ts_sign),
      client_cert: String(parsed.client_cert ?? ''),
      client_csr: String(parsed.client_csr ?? ''),
      privateKeyPem: String(parsed.privateKeyPem),
      deviceId: String(parsed.deviceId ?? DEVICE_ID),
      expiresAt: parsed.expiresAt == null ? null : Number(parsed.expiresAt),
      user: {
        id: String(parsed.user.id),
        nickname: String(parsed.user.nickname ?? ''),
        isVip: parsed.user.isVip === true,
      },
    };
  } catch {
    return null;
  }
};

const saveSession = (session: Session): void => {
  mkdirSync(AUTH_DIR, { recursive: true });
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
  chmodSync(SESSION_FILE, 0o600);
};

const clearSession = (): void => {
  try {
    rmSync(SESSION_FILE, { force: true });
  } catch {
    /* 已经不在 */
  }
};

// ---------------------------------------------------------------- ticket-guard

const der = (tag: number, ...values: Buffer[]): Buffer => {
  const value = Buffer.concat(values);
  const length =
    value.length < 128
      ? Buffer.from([value.length])
      : value.length < 256
        ? Buffer.from([0x81, value.length])
        : Buffer.from([0x82, value.length >> 8, value.length & 255]);
  return Buffer.concat([Buffer.from([tag]), length, value]);
};

/** 本地生成 P-256 密钥对，手搓 PKCS#10 CSR（换 ticket 用 -client-csr 提交）。 */
const csrOf = (privateKey: any, publicKey: any): string => {
  const subject = der(
    0x30,
    ...[[3, 'bd-ticket-guard'], [11, ''], [10, '']].map(([id, value]) =>
      der(0x31, der(0x30, der(6, Buffer.from([0x55, 4, Number(id)])), der(12, Buffer.from(String(value))))),
    ),
  );
  const info = der(0x30, der(2, Buffer.from([0])), subject, publicKey.export({ type: 'spki', format: 'der' }), der(0xa0));
  const algorithm = der(0x30, der(6, Buffer.from('2a8648ce3d040302', 'hex')));
  // BIT STRING 里必须是「0 未用位数 + 签名」，签名漏在外面会让服务端判 10001。
  const request = der(0x30, info, algorithm, der(3, Buffer.concat([Buffer.from([0]), sign('sha256', info, privateKey)])));
  const pem = `-----BEGIN CERTIFICATE REQUEST-----\n${request.toString('base64').match(/.{1,64}/g)!.join('\n')}\n-----END CERTIFICATE REQUEST-----\n`;
  return Buffer.from(pem).toString('base64');
};

const createGuard = (): { privateKeyPem: string; csr: string } => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return { privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), csr: csrOf(privateKey, publicKey) };
};

const guardHeaders = (session: Session, path: string): Record<string, string> => {
  const key = createPrivateKey({ key: session.privateKeyPem, format: 'pem' });
  const at = Math.floor(Date.now() / 1000);
  const content = `ticket=${session.ticket}&path=${PREFIX}${path}&timestamp=${at}`;
  const reqSign = sign('sha256', Buffer.from(content), key).toString('base64');
  const clientData = Buffer.from(
    JSON.stringify({ ts_sign: session.ts_sign, req_content: 'ticket,path,timestamp', req_sign: reqSign, timestamp: at }),
  ).toString('base64');
  return {
    'user-agent': UA,
    'content-type': 'application/json',
    'access-token': session.ticket,
    'bd-ticket-guard-version': '1',
    'bd-ticket-guard-client-cert': session.client_cert,
    'bd-ticket-guard-client-data': clientData,
  };
};

// ---------------------------------------------------------------- 扫码授权流程

const appIdentity = createHash('md5').update('com.luna.music.car').digest('hex');
const QR_PARAMS: Record<string, string> = {
  aid: '1128',
  client_key: 'aw4bbxfujo741d09',
  scope: 'user_info,luna.openapi.platform.interaction,luna.openapi.platform.me_tab,luna.commerce.openapi_platform.vip_info',
  state: '',
  next: '',
  jump_type: 'native',
  optional_scope_check: '',
  optional_scope_uncheck: '',
  customize_params: JSON.stringify({ source: 'pc_auth', not_skip_confirm: 'true' }),
  source_from: 'native',
  device_platform: 'android',
  app_identity: appIdentity,
  signature: 'cf9024ea72d9c71813238b13ea107a3d',
};

const QR_TTL = 5 * 60 * 1000;
type Pending = { key: string; token: string; expiresAt: number; indexUrl: string };
// 同时只保留一个待确认二维码，新码覆盖旧的。
let pending: Pending | null = null;

const readJson = async (res: Response): Promise<any> => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/** 平台接口的包裹层数不统一：有的字段直接放顶层，有的在 data / data.data。 */
const pick = (body: any, key: string): any => {
  if (!body || typeof body !== 'object') return undefined;
  if (body[key] != null) return body[key];
  const data = body.data;
  if (data && typeof data === 'object') {
    if (data[key] != null) return data[key];
    const inner = data.data;
    if (inner && typeof inner === 'object' && inner[key] != null) return inner[key];
  }
  return undefined;
};

const qrCreate = async (): Promise<{ key: string; qr: string; expiresAt: number; indexUrl: string }> => {
  const res = await fetch(`https://open.douyin.com/oauth/get_qrcode/?${new URLSearchParams(QR_PARAMS)}`, { headers: { 'user-agent': UA } });
  const body = await readJson(res);
  const qrToken = pick(body, 'token');
  const qrImage = pick(body, 'qrcode');
  if (!qrToken || !qrImage) throw new Error('出码失败');
  const key = randomBytes(16).toString('hex');
  const expiresAt = Date.now() + QR_TTL;
  // indexUrl 只是给用户复制到手机浏览器的纯文本，页面不给它做 href。
  const indexUrl = String(pick(body, 'qrcode_index_url') ?? '');
  pending = { key, token: String(qrToken), expiresAt, indexUrl };
  return { key, qr: `data:image/png;base64,${qrImage}`, expiresAt, indexUrl };
};

/** 用授权码换 access_code。必须走 open.qishui.com，且带全套车机公共参数。 */
const exchangeAccessCode = async (code: string, deviceId: string): Promise<{ access_code: string; open_id: string; expires_time?: number }> => {
  const res = await fetch(
    `https://open.qishui.com${PREFIX}/access/code/get/?${params(deviceId)}&auth_code=${encodeURIComponent(code)}`,
    { headers: { 'user-agent': UA } },
  );
  const body = await readJson(res);
  const access_code = pick(body, 'access_code');
  if (!access_code) {
    throw new Error(`换 access_code 失败 ${body?.err_no ?? res.status}: ${body?.err_msg ?? ''}`);
  }
  return { access_code: String(access_code), open_id: String(pick(body, 'open_id') ?? ''), expires_time: pick(body, 'expires_time') };
};

/** 用 access_code 换 ticket。CSR 用 -client-cert 会 10003 且消耗 code，必须 -client-csr。 */
const exchangeTicket = async (
  access: { access_code: string; open_id: string; expires_time?: number },
  guard: { privateKeyPem: string; csr: string },
  deviceId: string,
): Promise<Session> => {
  const res = await fetch(
    `https://open-client.douyin.com/passport/open/get_access_ticket/?${new URLSearchParams({ aid: '1128', client_key: 'aw4bbxfujo741d09', device_platform: 'android' })}`,
    {
      method: 'POST',
      headers: {
        'user-agent': UA,
        'content-type': 'application/x-www-form-urlencoded',
        'bd-ticket-guard-version': '1',
        'bd-ticket-guard-client-csr': guard.csr,
      },
      body: new URLSearchParams({ access_code: access.access_code, open_id: access.open_id }).toString(),
    },
  );
  const raw = res.headers.get('bd-ticket-guard-server-data');
  if (!raw) {
    const body = await readJson(res);
    throw new Error(`换 ticket 失败 ${res.status}/${res.headers.get('bd-tt-error-code') ?? ''}: ${body?.message ?? ''}`);
  }
  const data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as { ticket: string; ts_sign: string; client_cert: string };
  const cert = String(data.client_cert ?? '');
  return {
    accessCode: access.access_code,
    openId: access.open_id,
    ticket: data.ticket,
    ts_sign: data.ts_sign,
    client_cert: cert.includes('-----BEGIN') ? Buffer.from(cert).toString('base64') : cert,
    client_csr: guard.csr,
    privateKeyPem: guard.privateKeyPem,
    deviceId,
    expiresAt: access.expires_time ? Number(access.expires_time) * 1000 : null,
    user: { id: '', nickname: '', isVip: false },
  };
};

const fetchUser = async (session: Session): Promise<User> => {
  const res = await fetch(`https://open.douyin.com${PREFIX}/me/info/?${params(session.deviceId)}`, {
    method: 'POST',
    headers: guardHeaders(session, '/me/info/'),
    body: JSON.stringify({ common_params: {} }),
  });
  const body = await readJson(res);
  const mine = pick(body, 'my_info') ?? null;
  if (!mine?.id) throw new Error(`读身份失败 ${body?.err_no ?? res.status}: ${body?.err_msg ?? ''}`);
  return { id: String(mine.id), nickname: String(mine.nickname ?? ''), isVip: mine.is_vip === true };
};

/** 一次性跑完 access_code → ticket → me，中途任何一步失败都返回 stage，避免 code 被浪费。 */
const completeLogin = async (code: string): Promise<{ state: 'confirmed'; user: User } | { state: 'error'; stage: string; error: string }> => {
  const deviceId = String(Math.floor(1e18 + Math.random() * 9e18)).slice(0, 19);
  let stage = 'access-code';
  try {
    const access = await exchangeAccessCode(code, deviceId);
    stage = 'ticket';
    const session = await exchangeTicket(access, createGuard(), deviceId);
    stage = 'me';
    session.user = await fetchUser(session);
    saveSession(session);
    return { state: 'confirmed', user: session.user };
  } catch (error) {
    return { state: 'error', stage, error: (error as Error).message };
  }
};

const qrCheck = async (key: string): Promise<Record<string, unknown>> => {
  if (!pending || pending.key !== key) return { state: 'stale' };
  const current = pending;
  if (Date.now() > current.expiresAt) {
    pending = null;
    return { state: 'expired' };
  }
  const res = await fetch(
    `https://open.douyin.com/oauth/check_qrcode/?${new URLSearchParams({ ...QR_PARAMS, token: current.token, timestamp: String(Date.now()) })}`,
    { headers: { 'user-agent': UA } },
  );
  const body = await readJson(res);
  const state = String(pick(body, 'status') ?? '');
  if (state === 'new' || state === 'scanned') return { state };
  if (state === 'expired' || state === 'refused') {
    if (pending?.key === key) pending = null;
    return { state };
  }
  if (state !== 'confirmed') return { state: state || 'unknown' };

  const code = pick(body, 'code') ?? pick(body, 'auth_code');
  if (!code) return { state: 'error', stage: 'qrcode', error: '没有拿到授权码' };
  // 先占位消费掉，杜绝同一码被确认两次。
  if (pending?.key === key) pending = null;
  return completeLogin(String(code));
};

/** 过期前用 access_code 续期，再换一次 ticket，失败保持原会话。 */
const renewSession = async (session: Session): Promise<Session> => {
  const res = await fetch(`https://open.qishui.com${PREFIX}/access/code/refresh/?${params(session.deviceId)}&access_code=${encodeURIComponent(session.accessCode)}`, {
    headers: { 'user-agent': UA },
  });
  const body = await readJson(res);
  const access_code = pick(body, 'access_code');
  if (!access_code) throw new Error(`续期失败 ${body?.err_no ?? res.status}: ${body?.err_msg ?? ''}`);
  const renewed = await exchangeTicket(
    { access_code: String(access_code), open_id: String(pick(body, 'open_id') ?? session.openId), expires_time: pick(body, 'expires_time') },
    { privateKeyPem: session.privateKeyPem, csr: session.client_csr },
    session.deviceId,
  );
  renewed.user = await fetchUser(renewed);
  saveSession(renewed);
  return renewed;
};

const meState = async (): Promise<{ loggedIn: boolean; user?: User }> => {
  const session = readSession();
  if (!session) return { loggedIn: false };
  const fresh = session.expiresAt == null || session.expiresAt > Date.now() + 300_000;
  if (fresh) return { loggedIn: true, user: session.user };
  try {
    const renewed = await renewSession(session);
    return { loggedIn: true, user: renewed.user };
  } catch {
    // 续期失败也先把已有身份返回，播放仍可能可用；真的被拒时播放会报会员错误。
    return { loggedIn: true, user: session.user };
  }
};

export type Hit = { id: string; title: string; artist: string; duration: number; cover: string; playable: boolean };

const trackOf = (item: any): any | null => item?.entity?.track ?? item?.track_entity ?? item?.track ?? null;

const coverUrl = (track: any): string => {
  const cover = track?.display_info?.cover_url;
  const base = cover?.urls?.[0];
  if (!base || !cover?.uri) return '';
  return `${base}${cover.uri}~c5_375x375.jpg`;
};

const asDataUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!res.ok) return '';
    const type = res.headers.get('content-type') ?? 'image/jpeg';
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 400_000) return '';
    return `data:${type.split(';')[0]};base64,${bytes.toString('base64')}`;
  } catch {
    return '';
  }
};

// covers: 全部取图很慢（每张一次下载），歌单列表只要首曲做模糊底图。
const hitsOf = async (entities: any[], vip: boolean, limit = 8, covers: 'all' | 'first' = 'all'): Promise<Hit[]> => {
  const tracks = entities.map(trackOf).filter(Boolean).slice(0, limit);
  return Promise.all(
    tracks.map(async (track: any, index: number) => {
      const isFree = String(track?.commerce_info?.playable_condition ?? '') === '1 == 1';
      const full = track?.player_info?.full;
      const hasFull = !!full?.video_model_info?.video_model;
      // 会员登录后 svip 曲也允许播放，标记交给播放接口做最终判断。
      const playable = hasFull || vip;
      const wantCover = covers === 'all' ? playable || isFree : index === 0;
      return {
        id: String(track?.base_info?.id ?? ''),
        title: String(track?.base_info?.name ?? ''),
        artist: (track?.related_info?.artist_links ?? []).map((a: any) => a?.name).filter(Boolean).join(' / '),
        duration: Number(track?.base_info?.duration_ms ?? 0),
        cover: wantCover ? await asDataUrl(coverUrl(track)) : '',
        playable,
      };
    }),
  );
};

let searchCache: { key: string; at: number; hits: Hit[] } = { key: '', at: 0, hits: [] };

const search = async (q: string): Promise<Hit[]> => {
  if (searchCache.key === q && Date.now() - searchCache.at < 10 * 60 * 1000) return searchCache.hits;
  const session = readSession();
  const body = await platformPost(
    '/search/',
    {
      q,
      cursor: 0,
      search_id: 'openchamber',
      from_search_id: 'openchamber',
      search_method: 'input',
      search_type: 'track',
      search_scene: 'normal',
      scene_name: 'search',
      ab_param: '',
      last_viewed_media: {},
    },
    session,
  );
  const entities = (body?.data?.result_groups ?? []).flatMap((group: any) => group?.data ?? []);
  const hits = await hitsOf(entities, session?.user.isVip === true);
  searchCache = { key: q, at: Date.now(), hits };
  return hits;
};

// ---------------------------------------------------------------- 歌单

/** 账号接口（/me/playlist/）必须用 ticket-guard；匿名 token 会返回 28001003。 */
const guardPost = async (path: string, payload: Record<string, unknown>, session: Session): Promise<any> => {
  const res = await fetch(`https://open.douyin.com${PREFIX}${path}/?${params(session.deviceId)}`, {
    method: 'POST',
    headers: guardHeaders(session, path),
    body: JSON.stringify({ ...payload, common_params: { user_id: session.user.id } }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`汽水接口 ${res.status}`);
  const body = JSON.parse(text);
  const code = body?.err_no ?? body?.data?.error_code ?? 0;
  if (code) throw new Error(`汽水接口返回 ${code}: ${body?.err_msg ?? ''}`);
  return body;
};

type PlaylistRef = { id: string; title: string; count: number };

/** 账号歌单列表。「我喜欢的音乐」是 type === 1 的普通歌单，id 每个账号不同。 */
const playlists = async (session: Session): Promise<PlaylistRef[]> => {
  const body = await guardPost('/me/playlist/', { count: 100, cursor: '' }, session);
  const rows: any[] = body?.data?.playlists ?? body?.data?.playlist_list ?? [];
  return rows
    .map((row) => row?.base_info ?? row?.playlist?.base_info ?? row)
    .filter((base) => base?.id && base?.title)
    .map((base) => ({
      id: String(base.id),
      title: String(base.title),
      count: Number(base?.track_count ?? base?.media_count ?? 0),
    }));
};

const likedPlaylist = async (session: Session): Promise<PlaylistRef> => {
  const list = await playlists(session);
  const liked = list.find((item) => item.title.includes('我喜欢')) ?? list[0];
  if (!liked) throw new Error('账号里没有歌单');
  return liked;
};

/** /playlist/detail/ 反而吃匿名 token + user_id（guard 头会 28001003）。 */
const playlistDetail = async (id: string, session: Session): Promise<any[]> => {
  const body = await platformPost('/playlist/detail/', { playlist_id: id, owner_id: session.user.id, count: 100, cursor: '', type: 1 }, session);
  return (body?.data?.media_entities ?? []).map((entity: any) => String(entity?.media_id ?? entity?.track_entity?.base_info?.id ?? '')).filter(Boolean);
};

/** 批量取详情（一次 mget 最多 8 首，返回里可能少个别失效曲），按上限尽量补满。 */
const tracksByIds = async (ids: string[], session: Session | null, max = 8): Promise<Hit[]> => {
  const wanted: string[] = [];
  for (const id of ids) if (id && !wanted.includes(id)) wanted.push(id);
  const hits: Hit[] = [];
  for (let index = 0; index < wanted.length && hits.length < max; index += 8) {
    const batch = wanted.slice(index, index + 8);
    const body = await platformPost('/media/mget/', { media_list: batch.map((id) => ({ id, type: 'track' })) }, session);
    const entities = body?.data?.media_list ?? [];
    hits.push(...(await hitsOf(entities, session?.user.isVip === true, max - hits.length)));
  }
  return hits;
};

const PLAYLIST_MAX = 30;

/** source: "@liked" / "@me" 取账号收藏，否则按 id1|id2|... 取指定曲目。 */
const playlist = async (source: string): Promise<{ title: string; playlistId: string; total: number; tracks: Hit[]; error?: string }> => {
  const session = readSession();
  const raw = source.trim();
  if (!raw) throw new Error('没有给歌单');
  if (raw.startsWith('@')) {
    if (!session) throw new Error('歌单需要先扫码登录');
    const liked = await likedPlaylist(session);
    const ids = await playlistDetail(liked.id, session);
    // mget 偶尔少返回失效曲，多取一截补满。
    const tracks = await tracksByIds(ids.slice(0, PLAYLIST_MAX + 8), session, PLAYLIST_MAX);
    return { title: liked.title, playlistId: liked.id, total: ids.length, tracks };
  }
  const ids = raw.split('|').map((part) => part.trim()).filter(Boolean);
  if (!ids.length) throw new Error('没有给歌单');
  const wanted = ids.slice(0, PLAYLIST_MAX);
  // 指定 id 时给多少放多少（失效曲会被跳过），不再截半截。
  const tracks = await tracksByIds(wanted, session, wanted.length);
  if (!tracks.length) throw new Error('这些歌都拿不到');
  return { title: `${tracks.length} 首歌`, playlistId: '', total: ids.length, tracks };
};

const AUDIO_MAX = 6_000_000;let audioCache: { key: string; at: number; audio: { dataUrl: string; mime: string; size: number } } = { key: '', at: 0, audio: { dataUrl: '', mime: '', size: 0 } };

const audio = async (id: string, quality: string): Promise<{ dataUrl: string; mime: string; size: number }> => {
  const key = `${id}:${quality}`;
  if (audioCache.key === key && Date.now() - audioCache.at < 10 * 60 * 1000) return audioCache.audio;

  const body = await platformPost('/media/mget/', { media_list: [{ id, type: 'track' }] }, readSession());
  const track = body?.data?.media_list?.[0]?.track_entity;
  if (!track) throw new Error('找不到这首歌');
  const full = track?.player_info?.full;
  const model = full?.video_model_info?.video_model;
  if (!model) throw new Error('这首歌需要会员才能播放');

  const parsed = JSON.parse(String(model));
  const list = (parsed?.video_list ?? []).filter((item: any) => item?.main_url && item?.video_meta?.size);
  const pick = list.find((item: any) => item?.video_meta?.quality === quality) ?? list[0];
  if (!pick) throw new Error('这首歌没有可播地址');
  if (Number(pick.video_meta.size) > AUDIO_MAX) throw new Error('音质过大，换低一档');

  const encInfo = pick.encrypt_info ?? {};
  let bytes: Buffer;
  if (encInfo.encrypt) {
    const hexKey = isHexKey(encInfo.hex_key) ? encInfo.hex_key : decryptSpadeA(String(encInfo.spade_a ?? ''));
    if (!isHexKey(hexKey)) throw new Error('解密密钥无效');
    const encRes = await fetch(pick.main_url, { headers: { 'user-agent': UA } });
    if (!encRes.ok) throw new Error(`音频下载失败 ${encRes.status}`);
    bytes = decryptAudioBuffer(Buffer.from(await encRes.arrayBuffer()), hexKey).buffer;
  } else {
    const plain = await fetch(pick.main_url, { headers: { 'user-agent': UA } });
    if (!plain.ok) throw new Error(`音频下载失败 ${plain.status}`);
    bytes = Buffer.from(await plain.arrayBuffer());
  }

  const sniff = bytes.subarray(4, 8).toString('ascii') === 'ftyp' ? (bytes.subarray(8, 12).toString('ascii') === 'fLaC' ? 'audio/flac' : 'audio/mp4') : 'audio/mpeg';
  const result = { dataUrl: `data:${sniff};base64,${bytes.toString('base64')}`, mime: sniff, size: bytes.length };
  audioCache = { key, at: Date.now(), audio: result };
  return result;
};

const token_ = process.env.OPENCHAMBER_SERVICE_TOKEN;

const answer = (res: http.ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
};

http
  .createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${token_}`) {
      res.writeHead(401).end();
      return;
    }
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/health') {
      answer(res, 200, { ok: true });
      return;
    }
    if (url.pathname === '/login/qr') {
      qrCreate()
        .then((result) => answer(res, 200, result))
        .catch((error: Error) => answer(res, 200, { error: error.message }));
      return;
    }
    if (url.pathname === '/login/check') {
      const key = url.searchParams.get('key') ?? '';
      qrCheck(key)
        .then((result) => answer(res, 200, result))
        .catch((error: Error) => answer(res, 200, { state: 'error', stage: 'qrcode', error: error.message }));
      return;
    }
    if (url.pathname === '/me') {
      meState()
        .then((result) => answer(res, 200, result))
        .catch((error: Error) => answer(res, 200, { loggedIn: false, error: error.message }));
      return;
    }
    if (url.pathname === '/logout') {
      clearSession();
      pending = null;
      answer(res, 200, { ok: true });
      return;
    }
    if (url.pathname === '/search') {
      const q = (url.searchParams.get('q') ?? '').trim();
      if (!q) {
        answer(res, 200, { results: [] });
        return;
      }
      search(q)
        .then((results) => answer(res, 200, { results }))
        .catch((error: Error) => answer(res, 200, { results: [], error: error.message }));
      return;
    }
    if (url.pathname === '/playlist') {
      const source = (url.searchParams.get('source') ?? '').trim();
      if (!source) {
        answer(res, 200, { error: '缺少歌单' });
        return;
      }
      playlist(source)
        .then((result) => answer(res, 200, result))
        .catch((error: Error) => answer(res, 200, { error: error.message }));
      return;
    }
    if (url.pathname === '/playlists') {
      const session = readSession();
      if (!session) {
        answer(res, 200, { loggedIn: false, playlists: [] });
        return;
      }
      playlists(session)
        .then((rows) => answer(res, 200, { loggedIn: true, playlists: rows }))
        .catch((error: Error) => answer(res, 200, { loggedIn: true, playlists: [], error: error.message }));
      return;
    }
    if (url.pathname === '/audio') {
      const id = (url.searchParams.get('id') ?? '').trim();
      const quality = url.searchParams.get('quality') ?? 'medium';
      if (!id) {
        answer(res, 200, { error: '缺少歌曲 id' });
        return;
      }
      audio(id, quality)
        .then((result) => answer(res, 200, result))
        .catch((error: Error) => answer(res, 200, { error: error.message }));
      return;
    }
    answer(res, 404, { error: 'not found' });
  })
  .listen(Number(process.env.OPENCHAMBER_SERVICE_PORT), '127.0.0.1');

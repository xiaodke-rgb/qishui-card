import http from 'node:http';
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

const params = (): string => {
  const query = new URLSearchParams({
    ...COMMON,
    device_id: DEVICE_ID,
    did: DEVICE_ID,
    iid: DEVICE_ID,
    vehicle_id: `qishui-${DEVICE_ID}`,
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

const platformPost = async (path: string, payload: unknown): Promise<any> => {
  const res = await fetch(`https://open.douyin.com${PREFIX}${path}/?${params()}`, {
    method: 'POST',
    headers: { 'user-agent': UA, 'content-type': 'application/json', 'access-token': await clientToken() },
    body: JSON.stringify(payload),
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

export type Hit = { id: string; title: string; artist: string; duration: number; cover: string; playable: boolean };

const trackOf = (item: any): any | null => item?.entity?.track ?? item?.track ?? null;

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

const hitsOf = async (entities: any[]): Promise<Hit[]> => {
  const tracks = entities.map(trackOf).filter(Boolean);
  return Promise.all(
    tracks.slice(0, 8).map(async (track: any) => {
      const isFree = String(track?.commerce_info?.playable_condition ?? '') === "1 == 1";
      const full = track?.player_info?.full;
      const hasFull = isFree && !!full?.video_model_info?.video_model;
      return {
        id: String(track?.base_info?.id ?? ''),
        title: String(track?.base_info?.name ?? ''),
        artist: (track?.related_info?.artist_links ?? []).map((a: any) => a?.name).filter(Boolean).join(' / '),
        duration: Number(track?.base_info?.duration_ms ?? 0),
        cover: hasFull ? await asDataUrl(coverUrl(track)) : '',
        playable: hasFull,
      };
    }),
  );
};

let searchCache: { key: string; at: number; hits: Hit[] } = { key: '', at: 0, hits: [] };

const search = async (q: string): Promise<Hit[]> => {
  if (searchCache.key === q && Date.now() - searchCache.at < 10 * 60 * 1000) return searchCache.hits;
  const body = await platformPost('/search/', {
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
  });
  const entities = (body?.data?.result_groups ?? []).flatMap((group: any) => group?.data ?? []);
  const hits = await hitsOf(entities);
  searchCache = { key: q, at: Date.now(), hits };
  return hits;
};

const AUDIO_MAX = 6_000_000;
let audioCache: { key: string; at: number; audio: { dataUrl: string; mime: string; size: number } } = { key: '', at: 0, audio: { dataUrl: '', mime: '', size: 0 } };

const audio = async (id: string, quality: string): Promise<{ dataUrl: string; mime: string; size: number }> => {
  const key = `${id}:${quality}`;
  if (audioCache.key === key && Date.now() - audioCache.at < 10 * 60 * 1000) return audioCache.audio;

  const body = await platformPost('/media/mget/', { media_list: [{ id, type: 'track' }] });
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
    if (url.pathname === '/audio') {
      const id = (url.searchParams.get('id') ?? '').trim();
      const quality = url.searchParams.get('quality') ?? 'higher';
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

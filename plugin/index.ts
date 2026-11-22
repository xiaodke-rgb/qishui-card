/**
 * 汽水音乐搜索工具：让模型自己搜歌、排歌单。
 *
 * 这个文件由 OpenCode 直接加载（扩展把它写进托管配置），所以不能 import 任何东西，
 * 也不能依赖扩展里的模块。只用 fetch 打汽水车机 SDK 的公开接口。
 */

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

const params = (): string =>
  new URLSearchParams({
    ...COMMON,
    device_id: DEVICE_ID,
    did: DEVICE_ID,
    iid: DEVICE_ID,
    vehicle_id: `qishui-${DEVICE_ID}`,
    _timestamp: String(Math.floor(Date.now() / 1000)),
    _nonce: String(Math.floor(Math.random() * 1e6)),
  }).toString();

let token = '';
let tokenAt = 0;

const clientToken = async (): Promise<string> => {
  if (token && Date.now() - tokenAt < 10 * 60 * 1000) return token;
  const res = await fetch(`https://open.qishui.com${PREFIX}/client/token/get/?trigger_type=cold_start&${params()}`, {
    headers: { 'user-agent': UA },
  });
  const body: any = await res.json();
  if (!body?.client_token) throw new Error('汽水取 token 失败');
  token = String(body.client_token);
  tokenAt = Date.now();
  return token;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  seconds: number;
  free: boolean;
  hasFull: boolean;
};

const search = async (query: string, limit: number): Promise<Track[]> => {
  const access = await clientToken();
  const res = await fetch(`https://open.douyin.com${PREFIX}/search/?${params()}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': UA, 'access-token': access },
    body: JSON.stringify({
      q: query,
      cursor: 0,
      search_id: 'opencode-plugin',
      from_search_id: 'opencode-plugin',
      search_method: 'input',
      search_type: 'track',
      search_scene: 'normal',
      scene_name: 'search',
      ab_param: '',
      last_viewed_media: {},
    }),
  });
  const body: any = await res.json();
  if (body?.err_no) throw new Error(`汽水搜索失败 ${body.err_no}`);
  const groups: any[] = body?.data?.result_groups ?? [];
  const entities = groups.flatMap((group) => group?.data ?? []);
  const rows: Track[] = [];
  for (const item of entities) {
    const track = item?.entity?.track ?? item?.track_entity ?? item?.track;
    if (!track) continue;
    const id = String(track?.base_info?.id ?? '');
    if (!id) continue;
    rows.push({
      id,
      title: String(track?.base_info?.name ?? ''),
      artist: (track?.related_info?.artist_links ?? [])
        .map((a: any) => a?.name)
        .filter(Boolean)
        .join(' / '),
      seconds: Math.round(Number(track?.base_info?.duration_ms ?? 0) / 1000),
      free: String(track?.commerce_info?.playable_condition ?? '') === '1 == 1',
      hasFull: !!track?.player_info?.full?.video_model_info?.video_model,
    });
    if (rows.length >= limit) break;
  }
  return rows;
};

const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** 读扩展服务落的登录态，用来判断会员曲在这个账号下能不能听。读不到就当作未登录。 */
const isVip = async (): Promise<boolean> => {
  try {
    const fs = await import('node:fs');
    const os = await import('node:os');
    const path = await import('node:path');
    const file = path.join(os.homedir(), '.qishui-card', 'session.json');
    const session = JSON.parse(fs.readFileSync(file, 'utf8'));
    return session?.user?.isVip === true;
  } catch {
    return false;
  }
};

interface ToolResult {
  content: string;
}

interface ToolDefinition {
  name: string;
  description: string;
  options?: { codemode: boolean };
  input: unknown;
  execute: (input: any) => Promise<ToolResult>;
}

interface ToolList {
  add: (tool: ToolDefinition) => void;
}

interface PluginContext {
  tool: { transform: (edit: (tools: ToolList) => void) => Promise<void> };
}

export default {
  id: 'qishui-card-plugin',
  setup: async (ctx: PluginContext) => {
    await ctx.tool.transform((tools) => {
      tools.add({
        name: 'qishui_search',
        description:
          '在汽水音乐里搜歌，返回可播放曲目的 id、歌名、歌手、时长。给用户挑歌或排歌单时用：把选中的 id 用 | 连起来，写成 QishuiPlaylist("id1|id2|...") 放进 openui-lang 代码块，卡片就能整张播放。',
        options: { codemode: false },
        input: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索词，歌名带上歌手更准，例如「晴天 周杰伦」' },
            limit: { type: 'number', description: '要几条，默认 8，最多 20' },
          },
          required: ['query'],
          additionalProperties: false,
        },
        async execute(input: { query?: string; limit?: number }) {
          const query = String(input?.query ?? '').trim();
          if (!query) return { content: '没有给搜索词。' };
          const limit = Math.min(Math.max(Number(input?.limit ?? 8) || 8, 1), 20);
          try {
            const rows = await search(query, limit);
            if (!rows.length) return { content: `「${query}」没有搜到可播放的曲子。` };
            const vip = await isVip();
            const lines = rows.map((row, index) => {
              const tag = row.free || row.hasFull || vip ? '可播' : '需会员';
              return `${index + 1}. ${row.id} · ${row.title} · ${row.artist} · ${clock(row.seconds)} · ${tag}`;
            });
            return {
              content: [
                `「${query}」搜到 ${rows.length} 首（格式：序号. id · 歌名 · 歌手 · 时长 · 可播性）：`,
                ...lines,
                '',
                '排歌单时把要放的 id 用 | 连起来：QishuiPlaylist("id1|id2|id3")',
              ].join('\n'),
            };
          } catch (error) {
            return { content: `搜索失败：${error instanceof Error ? error.message : String(error)}` };
          }
        },
      });
    });
  },
};

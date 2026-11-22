import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root')!;

type Hit = { id: string; title: string; artist: string; duration: number; cover: string; playable: boolean };

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

const clock = (ms: number): string => {
  if (!ms) return '';
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const note = (text: string): HTMLElement => {
  const element = document.createElement('div');
  element.className = 'note';
  element.textContent = text;
  return element;
};

let requested = '';

const read = async <T>(path: string, query: Record<string, string>): Promise<T> => {
  const answer = await host.serviceRequest({ method: 'GET', path, query });
  try {
    return JSON.parse(String(answer.body ?? '{}')) as T;
  } catch {
    return {} as T;
  }
};

const search = async (query: string): Promise<{ results: Hit[]; error?: string }> => {
  const body = await read<{ results?: Hit[]; error?: string }>('/search', { q: query });
  return { results: body?.results ?? [], error: body?.error };
};

const loadAudio = async (id: string): Promise<Uint8Array> => {
  const body = await read<{ dataUrl?: string; error?: string }>('/audio', { id, quality: 'medium' });
  if (!body?.dataUrl) throw new Error(body?.error ?? '拿不到音频');
  const binary = atob(body.dataUrl.slice(body.dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

const render = async (query: string): Promise<void> => {
  root.replaceChildren(note('正在搜索…'));
  let hits: Hit[] = [];
  try {
    const found = await search(query);
    hits = found.results;
  } catch (error) {
    root.replaceChildren(note(`搜索失败：${(error as Error).message}`));
    return;
  }

  // 会员登录后 svip 曲也可以播；服务端已按登录态标过，这里再兜一次底。
  if (hits.some((hit) => !hit.playable)) {
    try {
      const me = await read<{ loggedIn?: boolean; user?: { isVip?: boolean } }>('/me');
      if (me?.loggedIn && me?.user?.isVip) hits = hits.map((hit) => ({ ...hit, playable: true }));
    } catch {
      /* 读不到登录态就当未登录 */
    }
  }

  const playable = hits.filter((hit) => hit.playable);
  if (!hits.length) {
    root.replaceChildren(note(`汽水上没搜到「${query}」`));
    return;
  }
  if (!playable.length) {
    root.replaceChildren(note(`「${query}」的版本都要会员才能播`));
    return;
  }

  let current = playable[0];

  const card = document.createElement('div');
  card.className = 'card';

  const veil = document.createElement('div');
  veil.className = 'veil';

  const cover = document.createElement('img');
  cover.className = 'cover';
  cover.alt = '';
  cover.hidden = !current.cover;
  if (current.cover) cover.src = current.cover;

  const meta = document.createElement('div');
  meta.className = 'meta';
  const title = document.createElement('div');
  title.className = 'title';
  const artist = document.createElement('div');
  artist.className = 'artist';
  const bar = document.createElement('div');
  bar.className = 'bar';
  const progress = document.createElement('i');
  bar.append(progress);
  meta.append(title, artist, bar);

  const button = document.createElement('button');
  button.className = 'play';
  button.type = 'button';
  button.innerHTML = ICON_PLAY;
  button.title = '播放';

  const row = document.createElement('div');
  row.className = 'row';

  const chips = document.createElement('div');
  chips.className = 'chips';

  row.append(cover, meta, button);
  card.append(veil, row, chips);
  root.replaceChildren(card);

  // iOS 的 WKWebView 在沙箱 iframe 里不接受 <audio> 的 blob:/data: 音源（NotSupportedError），
  // 所以用 Web Audio 解码后播放。
  let context: AudioContext | null = null;
  let buffer: AudioBuffer | null = null;
  let source: AudioBufferSourceNode | null = null;
  let startedAt = 0;
  let offset = 0;
  let playing = false;
  let ticker: number | null = null;
  let opening = false;

  const audioContext = (): AudioContext => {
    if (!context) {
      const Constructor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) throw new Error('这个环境不支持音频');
      context = new Constructor();
    }
    return context;
  };

  // iOS 只在用户手势的同一拍里允许启动 AudioContext，晚于 await 再建会被挂起，
  // 随后的 decodeAudioData 就报解码失败。所以在点击处理器里同步建好并唤醒。
  const unlock = (): AudioContext => {
    const ctx = audioContext();
    if (ctx.state !== 'running') void ctx.resume();
    return ctx;
  };

  const position = (): number => {
    if (!context || !playing) return offset;
    return offset + (context.currentTime - startedAt);
  };

  const tick = (): void => {
    const total = (buffer?.duration ?? 0) || current.duration / 1000;
    if (total > 0) progress.style.width = `${Math.min(100, (position() / total) * 100)}%`;
  };

  const mark = (value: boolean): void => {
    playing = value;
    button.innerHTML = value ? ICON_PAUSE : ICON_PLAY;
    button.title = value ? '暂停' : '播放';
    if (value) {
      if (ticker === null) ticker = window.setInterval(tick, 250);
    } else if (ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
  };

  const release = (): void => {
    if (!source) return;
    source.onended = null;
    try {
      source.stop();
    } catch {
      /* already stopped */
    }
    source = null;
  };

  const reset = (): void => {
    release();
    offset = 0;
    mark(false);
    progress.style.width = '0%';
  };

  const resume = (): void => {
    if (!buffer) return;
    const ctx = audioContext();
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(ctx.destination);
    node.onended = () => {
      if (source !== node) return;
      source = null;
      offset = 0;
      mark(false);
      progress.style.width = '0%';
    };
    node.start(0, offset);
    source = node;
    startedAt = ctx.currentTime;
    mark(true);
  };

  const pause = (): void => {
    if (!playing) return;
    if (context) offset = Math.max(0, offset + (context.currentTime - startedAt));
    release();
    mark(false);
  };

  const toggle = async (): Promise<void> => {
    if (playing) {
      pause();
      return;
    }
    if (opening) return;
    opening = true;
    button.classList.add('busy');
    const ctx = unlock();
    try {
      if (offset > 0 && buffer && offset >= buffer.duration - 0.2) offset = 0;
      if (!buffer) {
        const bytes = await loadAudio(current.id);
        buffer = await ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
      }
      resume();
    } catch (error) {
      const message = (error as Error).message;
      artist.textContent = /会员|没有可播|过大|解码|不支持/.test(message)
        ? message
        : `播放失败：${message || '音源解码失败'}`;
    } finally {
      opening = false;
      button.classList.remove('busy');
    }
  };

  button.addEventListener('click', () => void toggle());

  // 进度条可拖：按下即定位，拖动时实时跟手，松开继续播原来的播放状态。
  const seek = (fraction: number): void => {
    const total = (buffer?.duration ?? 0) || current.duration / 1000;
    if (!total) return;
    offset = Math.min(Math.max(fraction, 0), 1) * total;
    if (playing) {
      release();
      resume();
    } else {
      progress.style.width = `${(offset / total) * 100}%`;
    }
  };

  const fractionAt = (event: PointerEvent): number => {
    const box = bar.getBoundingClientRect();
    return box.width > 0 ? (event.clientX - box.left) / box.width : 0;
  };

  bar.addEventListener('pointerdown', (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    bar.setPointerCapture(event.pointerId);
    // 拖动时不要 0.2s 缓动，否则手感粘。
    progress.style.transition = 'none';
    seek(fractionAt(event));
    const move = (moveEvent: PointerEvent): void => seek(fractionAt(moveEvent));
    const up = (): void => {
      progress.style.transition = '';
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });

  const paint = (): void => {
    title.textContent = current.title;
    artist.textContent = [current.artist, clock(current.duration)].filter(Boolean).join(' · ');

    if (current.cover) {
      cover.src = current.cover;
      veil.style.backgroundImage = `url("${current.cover}")`;
      cover.hidden = false;
      card.classList.remove('plain');
    } else {
      cover.removeAttribute('src');
      cover.hidden = true;
      veil.style.backgroundImage = '';
      card.classList.add('plain');
    }
    progress.style.width = '0%';
  };

  const otherVersions = (): void => {
    chips.replaceChildren();
    const many = playable.length > 1;
    chips.hidden = !many;
    row.classList.toggle('tight', !many);
    if (!many) return;
    for (const hit of playable.slice(0, 4)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = hit.artist ? `${hit.title} · ${hit.artist}` : hit.title;
      chip.setAttribute('aria-pressed', String(hit.id === current.id));
      chip.addEventListener('click', () => {
        if (hit.id === current.id) return;
        reset();
        buffer = null;
        current = hit;
        paint();
        otherVersions();
      });
      chips.append(chip);
    }
  };

  paint();
  otherVersions();
};

host.onReady((context) => applyHostReady(context, document.documentElement));

host.onBlock(({ args }) => {
  const record = (args ?? {}) as Record<string, string>;
  const query = String(record.query ?? Object.values(record)[0] ?? '').trim();
  if (!query) {
    root.replaceChildren(note('没有给歌名'));
    return;
  }
  if (query === requested) return;
  requested = query;
  void render(query);
});

new ResizeObserver(() => {
  void host.setHeight(Math.ceil(root.getBoundingClientRect().height));
}).observe(root);

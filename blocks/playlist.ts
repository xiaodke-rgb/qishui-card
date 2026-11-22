import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root')!;

type Hit = { id: string; title: string; artist: string; duration: number; cover: string; playable: boolean };
type Playlist = { title: string; playlistId: string; total: number; tracks: Hit[]; error?: string };

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
const ICON_PLAY_ALL = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_CHEV = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>';

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

const load = async (source: string): Promise<Playlist> => {
  const body = await read<Playlist>('/playlist', { source });
  return body ?? ({} as Playlist);
};

const loadAudio = async (id: string): Promise<Uint8Array> => {
  const body = await read<{ dataUrl?: string; error?: string }>('/audio', { id, quality: 'medium' });
  if (!body?.dataUrl) throw new Error(body?.error ?? '拿不到音频');
  const binary = atob(body.dataUrl.slice(body.dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

const render = async (source: string): Promise<void> => {
  root.replaceChildren(note('正在取歌单…'));
  let data: Playlist;
  try {
    data = await load(source);
  } catch (error) {
    root.replaceChildren(note(`取歌单失败：${(error as Error).message}`));
    return;
  }
  let tracks = (data.tracks ?? []).filter((track) => track.playable);
  if (data.error) {
    root.replaceChildren(note(data.error));
    return;
  }
  if (!tracks.length) {
    root.replaceChildren(note('这个歌单里没有可播的歌'));
    return;
  }

  // 会员登录后 svip 曲也能播；服务端已按登录态标过，这里再兜一次底。
  if (tracks.length !== (data.tracks ?? []).length) {
    try {
      const me = await read<{ loggedIn?: boolean; user?: { isVip?: boolean } }>('/me');
      if (me?.loggedIn && me?.user?.isVip) tracks = data.tracks ?? tracks;
    } catch {
      /* 读不到登录态就按已标好的来 */
    }
  }

  let index = 0;

  const card = document.createElement('div');
  card.className = 'card';

  const veil = document.createElement('div');
  veil.className = 'veil';

  const cover = document.createElement('img');
  cover.className = 'cover';
  cover.alt = '';

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

  const allrow = document.createElement('button');
  allrow.className = 'allrow';
  allrow.type = 'button';
  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.innerHTML = ICON_PLAY_ALL;
  const allLabel = document.createElement('span');
  allLabel.className = 'alltext';
  const chev = document.createElement('span');
  chev.className = 'chev';
  chev.innerHTML = ICON_CHEV;
  allrow.append(dot, allLabel, chev);

  const list = document.createElement('div');
  list.className = 'list';
  const divider = document.createElement('div');
  divider.className = 'divider';
  list.append(divider);

  const rows: { node: HTMLElement; ix: HTMLElement }[] = [];
  tracks.forEach((track, position) => {
    const item = document.createElement('button');
    item.className = 'tr';
    item.type = 'button';
    const ix = document.createElement('span');
    ix.className = 'ix';
    ix.textContent = String(position + 1);
    const text = document.createElement('span');
    text.className = 'tn';
    text.textContent = track.title;
    if (track.artist) {
      const sub = document.createElement('small');
      sub.textContent = track.artist;
      text.append(sub);
    }
    const dur = document.createElement('span');
    dur.className = 'dur';
    dur.textContent = clock(track.duration);
    item.append(ix, text, dur);
    item.addEventListener('click', () => void start(position));
    list.append(item);
    rows.push({ node: item, ix });
  });

  row.append(cover, meta, button);
  card.append(veil, row, allrow, list);
  root.replaceChildren(card);

  // iOS 的 WKWebView 在沙箱 iframe 里不接受 <audio> 的 blob:/data: 音源，改用 Web Audio。
  let context: AudioContext | null = null;
  let buffers = new Map<string, AudioBuffer>();
  let node: AudioBufferSourceNode | null = null;
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

  // iOS 只允许在用户手势同一拍里启动 AudioContext，晚于 await 再建会被挂起。
  const unlock = (): AudioContext => {
    const ctx = audioContext();
    if (ctx.state !== 'running') void ctx.resume();
    return ctx;
  };

  const current = (): Hit => tracks[index];

  const position = (): number => {
    if (!context || !playing) return offset;
    return offset + (context.currentTime - startedAt);
  };

  const tick = (): void => {
    const total = (buffers.get(current().id)?.duration ?? 0) || current().duration / 1000;
    if (total > 0) progress.style.width = `${Math.min(100, (position() / total) * 100)}%`;
  };

  const mark = (value: boolean): void => {
    playing = value;
    button.innerHTML = value ? ICON_PAUSE : ICON_PLAY;
    button.title = value ? '暂停' : '播放';
    const on = rows[index];
    if (on) {
      on.node.classList.toggle('on', true);
      // 当前曲在可视 5 首之外时，把它滚进视野。
      if (value && card.classList.contains('open')) {
        const top = on.node.offsetTop;
        const bottom = top + on.node.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top - divider.offsetHeight - 4;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }
      // 当前曲的序号换成跳动的均衡器条，暂停时停住。
      if (!on.ix.querySelector('.eq')) {
        const eq = document.createElement('span');
        eq.className = 'eq';
        eq.innerHTML = '<i></i><i></i><i></i>';
        on.ix.replaceChildren(eq);
      }
      const eq = on.ix.querySelector('.eq');
      if (eq) eq.classList.toggle('paused', !value);
    }
    if (value) {
      if (ticker === null) ticker = window.setInterval(tick, 250);
    } else if (ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
  };

  const release = (): void => {
    if (!node) return;
    node.onended = null;
    try {
      node.stop();
    } catch {
      /* already stopped */
    }
    node = null;
  };

  const reset = (): void => {
    release();
    offset = 0;
    playing = false;
    if (ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
    progress.style.width = '0%';
    button.innerHTML = ICON_PLAY;
    button.title = '播放';
  };

  const paint = (): void => {
    const track = current();
    title.textContent = data.title || track.title;
    const parts = [track.title !== title.textContent ? track.title : '', track.artist, clock(track.duration)].filter(Boolean);
    artist.textContent = parts.join(' · ');
    if (track.cover) {
      cover.src = track.cover;
      veil.style.backgroundImage = `url("${track.cover}")`;
      cover.hidden = false;
      card.classList.remove('plain');
    } else {
      cover.removeAttribute('src');
      cover.hidden = true;
      veil.style.backgroundImage = '';
      card.classList.add('plain');
    }
    progress.style.width = '0%';
    rows.forEach((item, position) => {
      item.node.classList.toggle('on', position === index);
      if (position !== index) item.ix.textContent = String(position + 1);
    });
    allLabel.textContent = card.classList.contains('open')
      ? `收起列表 · 共 ${tracks.length} 首`
      : `播放全部 · 共 ${tracks.length} 首`;
  };

  const resume = (): void => {
    const buffer = buffers.get(current().id);
    if (!buffer) return;
    const ctx = audioContext();
    const started = ctx.createBufferSource();
    started.buffer = buffer;
    started.connect(ctx.destination);
    started.onended = () => {
      if (node !== started) return;
      node = null;
      offset = 0;
      // 自动下一首；最后一首播完就停下。
      if (index + 1 < tracks.length) {
        void start(index + 1, true);
        return;
      }
      mark(false);
      progress.style.width = '0%';
    };
    started.start(0, offset);
    node = started;
    startedAt = ctx.currentTime;
    mark(true);
  };

  const ensureBuffer = async (track: Hit, ctx: AudioContext): Promise<AudioBuffer> => {
    const cached = buffers.get(track.id);
    if (cached) return cached;
    const bytes = await loadAudio(track.id);
    const decoded = await ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (buffers.size >= 4) {
      const oldest = buffers.keys().next();
      if (!oldest.done) buffers.delete(oldest.value);
    }
    buffers.set(track.id, decoded);
    return decoded;
  };

  const start = async (position: number, auto = false): Promise<void> => {
    if (opening) return;
    if (!auto) {
      reset();
      index = position;
      offset = 0;
      paint();
    } else {
      index = position;
      offset = 0;
      paint();
    }
    opening = true;
    button.classList.add('busy');
    const ctx = auto ? audioContext() : unlock();
    try {
      await ensureBuffer(current(), ctx);
      resume();
    } catch (error) {
      const message = (error as Error).message;
      artist.textContent = /会员|没有可播|过大|解码|不支持/.test(message)
        ? message
        : `播放失败：${message || '音源解码失败'}`;
      mark(false);
    } finally {
      opening = false;
      button.classList.remove('busy');
    }
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
    if (offset > 0) {
      const total = buffers.get(current().id)?.duration ?? 0;
      if (total > 0 && offset >= total - 0.2) offset = 0;
      opening = true;
      button.classList.add('busy');
      try {
        resume();
      } finally {
        opening = false;
        button.classList.remove('busy');
      }
      return;
    }
    await start(index);
  };

  button.addEventListener('click', () => void toggle());

  // 进度条可拖：按下即定位，拖动时跟手，松开后按原播放状态继续。
  const seek = (fraction: number): void => {
    const total = buffers.get(current().id)?.duration ?? 0;
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

  allrow.addEventListener('click', () => {
    const open = card.classList.toggle('open');
    allLabel.textContent = open ? `收起列表 · 共 ${tracks.length} 首` : `播放全部 · 共 ${tracks.length} 首`;
    void host.setHeight(Math.ceil(root.getBoundingClientRect().height));
    // 第一次展开顺手开播，符合「点开就能听」。
    if (open && !playing && offset === 0) void start(0);
  });

  paint();
  allLabel.textContent = `播放全部 · 共 ${tracks.length} 首`;

  // 展开区固定露出 5 首，其余上下滑动；行高按实际渲染量出来，换字号也不会错位。
  const fitList = (): void => {
    const first = rows[0]?.node;
    if (!first) return;
    const rowHeight = first.getBoundingClientRect().height;
    if (!rowHeight) return;
    const dividerHeight = divider.getBoundingClientRect().height + 4;
    list.style.maxHeight = `${Math.ceil(rowHeight * 5 + dividerHeight + 6)}px`;
  };
  fitList();
  requestAnimationFrame(fitList);
};

host.onReady((context) => applyHostReady(context, document.documentElement));

host.onBlock(({ args }) => {
  const record = (args ?? {}) as Record<string, string>;
  const source = String(record.source ?? record.query ?? Object.values(record)[0] ?? '').trim();
  if (!source) {
    root.replaceChildren(note('没有给歌单'));
    return;
  }
  if (source === requested) return;
  requested = source;
  void render(source);
});

new ResizeObserver(() => {
  void host.setHeight(Math.ceil(root.getBoundingClientRect().height));
}).observe(root);

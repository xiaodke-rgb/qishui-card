import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root')!;

type QrAnswer = { key?: string; qr?: string; expiresAt?: number; error?: string };
type CheckAnswer = { state?: string; user?: { id?: string; nickname?: string; isVip?: boolean }; stage?: string; error?: string };

const read = async <T,>(path: string, query: Record<string, string> = {}): Promise<T> => {
  const answer = await host.serviceRequest({ method: 'GET', path, query });
  try {
    return JSON.parse(String(answer.body ?? '{}')) as T;
  } catch {
    return {} as T;
  }
};

// 上一轮卡片留下的轮询，重建时必须先停掉，否则会叠出多个计时器。
let timer: number | null = null;
let generation = 0;

const stop = (): void => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

const render = (): void => {
  const card = el('div', 'card');
  const body = el('div', 'body');
  const image = el('img', 'qr');
  image.alt = '登录二维码';
  image.hidden = true;
  const status = el('div', 'status');
  status.textContent = '正在生成二维码…';
  const actions = el('div', 'actions');
  const again = el('button');
  again.type = 'button';
  again.textContent = '重新生成';
  again.hidden = true;
  actions.append(again);
  const details = el('details');
  const summary = el('summary');
  summary.textContent = '二维码链接';
  const link = el('code');
  details.append(summary, link);
  details.hidden = true;
  body.append(image, status, actions, details);
  card.append(body);
  root.replaceChildren(card);
};

const say = (text: string, tone?: 'ok' | 'bad'): void => {
  const status = root.querySelector<HTMLElement>('.status');
  if (!status) return;
  status.textContent = text;
  status.className = `status${tone ? ` ${tone}` : ''}`;
};

const showQr = (src: string): void => {
  const image = root.querySelector<HTMLImageElement>('.qr');
  if (!image) return;
  image.src = src;
  image.hidden = false;
};

const start = async (): Promise<void> => {
  const mine = ++generation;
  stop();
  render();
  const again = root.querySelector<HTMLButtonElement>('.actions button')!;
  again.addEventListener('click', () => void start());

  let created: QrAnswer;
  try {
    created = await read<QrAnswer>('/login/qr');
  } catch (error) {
    say(`出码失败：${(error as Error).message}`, 'bad');
    again.hidden = false;
    return;
  }
  if (mine !== generation) return;
  if (!created?.qr || !created?.key) {
    say(`出码失败：${created?.error ?? '没有二维码'}`, 'bad');
    again.hidden = false;
    return;
  }

  showQr(created.qr);
  say('等待扫码');
  again.hidden = false;
  const key = created.key;

  // 直达链接只作为纯文本给出，block 在没 allow-popups 的 iframe 里，点了没反应。
  const details = root.querySelector<HTMLDetailsElement>('details');
  const link = root.querySelector<HTMLElement>('details code');
  if (details && link && created.indexUrl) {
    link.textContent = created.indexUrl;
    const hint = el('div', 'hint');
    hint.textContent = '复制到手机浏览器可直达';
    details.append(hint);
    details.hidden = false;
  }

  let busy = false;
  timer = window.setInterval(() => {
    if (busy || mine !== generation) return;
    busy = true;
    void (async () => {
      let answer: CheckAnswer;
      try {
        answer = await read<CheckAnswer>('/login/check', { key });
      } catch (error) {
        say(`查询失败：${(error as Error).message}`, 'bad');
        return;
      } finally {
        busy = false;
      }
      if (mine !== generation) return;
      const state = String(answer?.state ?? '');
      if (state === 'new') {
        say('等待扫码');
        return;
      }
      if (state === 'scanned') {
        say('已扫码，请在手机上确认');
        return;
      }
      if (state === 'confirmed') {
        stop();
        const nickname = String(answer.user?.nickname ?? '');
        const vip = answer.user?.isVip === true;
        say(`已登录：${nickname}${vip ? '（会员）' : ''}`, 'ok');
        again.hidden = true;
        const image = root.querySelector<HTMLImageElement>('.qr');
        if (image) image.hidden = true;
        try {
          await host.answerBlock(`已登录：${nickname}`);
        } catch {
          /* 宿主可能已经不在等这个答案 */
        }
        return;
      }
      if (state === 'expired' || state === 'refused' || state === 'stale') {
        stop();
        say(state === 'expired' ? '已过期，点「重新生成」' : state === 'refused' ? '已拒绝登录，请重新生成' : '二维码已失效，请重新生成', 'bad');
        const image = root.querySelector<HTMLImageElement>('.qr');
        if (image) image.hidden = true;
        again.hidden = false;
        return;
      }
      // error：把 stage 说清楚，但不要自动答话。
      stop();
      say(`失败（${answer?.stage ?? state}）：${answer?.error ?? '未知错误'}`, 'bad');
      again.hidden = false;
    })();
  }, 2000);
};

host.onReady((context) => applyHostReady(context, document.documentElement));

host.onBlock(() => {
  void start();
});

new ResizeObserver(() => {
  void host.setHeight(Math.ceil(root.getBoundingClientRect().height));
}).observe(root);

window.addEventListener('unload', () => {
  generation += 1;
  stop();
});

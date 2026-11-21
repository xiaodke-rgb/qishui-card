import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

const host = connectHost();
host.onReady((context) => applyHostReady(context, document.documentElement));

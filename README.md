# 汽水音乐卡片 / qishui-card

一个 [OpenChamber](https://openchamber.dev) 扩展：在聊天回复里画汽水音乐卡片，搜索歌曲、点开就听。手机端也能显示和播放。

```
root = Stack([card])
card = QishuiCard("天若有情")
```

卡片会自己搜索、列出可播版本（同名不同歌手/版本用底部胶囊切换）、拉封面、取下整首音频并播放。

三个块：

| 块 | 用法 | 作用 |
| --- | --- | --- |
| `QishuiCard(query)` | `QishuiCard("晴天 周杰伦")` | 搜一首歌，直接播 |
| `QishuiPlaylist(source)` | `QishuiPlaylist("@liked")` | 歌单：折叠与单曲卡一致，展开后列表最多露 5 首、多的滑动，可切歌、自动续播 |
| `QishuiLogin()` | `QishuiLogin()` | 扫码登录，登录后会员曲也能整首播放 |

`QishuiPlaylist` 的 `source` 支持两种：`@liked` 取账号「我喜欢的音乐」，或 `id1|id2|...` 直接指定曲目（便于让模型自己搜歌、排序后拼出来）。

## 安装

要求 OpenChamber >= 2.7.4（聊天区块从 2.7.0 起支持，手机端区块从 2.7.1 起支持）。

```bash
git clone https://github.com/xiaodke-rgb/qishui-card.git
cd qishui-card
bun install
```

然后在 OpenChamber 的设置 → 扩展里添加该目录的绝对路径，或者直接打开：

```
[安装汽水音乐卡片](openchamber://extensions/install?path=/绝对路径/qishui-card)
```

安装时会请求两项权限：`service`（本地服务进程，搜歌、取音频、扫码登录都靠它）和 `opencodePlugin`（把 `qishui_search` 工具装进 OpenCode，让模型自己搜歌排歌单）。两项都点允许：缺 `service` 播不了，缺 `opencodePlugin` 就只能人工查 id。

## 用法

在任意回复里写一个 `openui-lang` 代码块，放一行组件调用：

````
```openui-lang
root = Stack([card])
card = QishuiCard("晴天 周杰伦")
```
````

`QishuiCard(query)` 只有一个参数：搜索词，歌名带上歌手更准。

装了 `opencodePlugin` 后模型自己就有 `qishui_search` 工具：它能搜到真实曲目 id，再用 `QishuiPlaylist("id1|id2|id3")` 拼成可直接播放的歌单，不用人工查 id。

## 它是怎么工作的

三个部分：

| 部分 | 作用 |
| --- | --- |
| `blocks/card.*` | 单曲区块：封面、歌名、歌手、圆形播放键、进度条、版本胶囊 |
| `blocks/playlist.*` | 歌单区块：折叠态同单曲卡，展开后是 5 首视窗的滚动列表 |
| `blocks/login.*` | 登录区块：二维码、状态行、重新生成 |
| `service/main.*` | 本地服务：搜索、歌单、取封面、下载音频、解密、扫码登录 |
| `service/decrypt.*` | 解密器：剥掉 CENC 加密容器，输出干净的可播 MP4 |
| `plugin/index.*` | OpenCode 插件：注册 `qishui_search` 工具，只打搜索接口，不依赖服务 |

细节：

- **搜索**走汽水车机端 SDK 的公开接口（`open.qishui.com` 换 anonymous client token，`open.douyin.com/api/luna/v1/platform/search/` 搜曲）。token 作为 HTTP header `access-token` 发送，放 query 里会报 `28001003`。
- **音频**取 `player_info.full.video_model` 里 `higher` 档（约 4 MB），避开 8 MB 的 `serviceRequest` 响应上限；`lossless` 档约 47 MB 会被拒绝。
- **解密**：音频是 `cenc-aes-ctr` 加密的，`spade_a` 里能解出 AES-128 密钥。解密后必须把 MP4 的 sample entry 从 `enca` 改回 `mp4a` 并剥掉 `sinf/schi/tenc/schm/frma`，否则 Apple 的解码器会拒绝（安卓容错，照样能播）。
- **播放**用 Web Audio：点击时同步创建 `AudioContext` 并 `decodeAudioData`，再经 `AudioBufferSourceNode` 出声。不用 `<audio>`，因为 iOS WKWebView 在沙箱 iframe 里对 `blob:`/`data:` 的 `<audio>` 直接报 `NotSupportedError`。
- **封面**以 `data:` URL 回传，页面拿它当 `<img>` 并在卡片背景模糊放大铺底。没有封面时自动退化成主题色卡片。
- **歌单**：`/me/playlist/` 必须用 ticket-guard 鉴权（匿名 token 返回 `28001003`），`/playlist/detail/` 反而必须用匿名 token + `common_params.user_id`（带 guard 会 `28001003`）。「我喜欢的音乐」是 `base_info.type === 1` 的普通歌单，id 每个账号不同，要先列歌单再翻页取曲目；批量详情用 `/media/mget/`，一次最多 8 个。
- **会员曲**：未登录时 `player_info.full` 里没有 `video_model_info`，只给 30/60 秒加密预览；扫码登录后整首才出现。平台接口在 `open.douyin.com`，`open.qishui.com` 只承担 `client/token/get`、`access/code/get`、`access/code/refresh`。

沙箱页面不能联网，所有数据都经 `host.serviceRequest` 从扩展自己的本地服务取。

## 开发

```bash
bun install
bunx openchamber-guest-bundle blocks/card.ts blocks/card.js
bunx openchamber-guest-bundle blocks/playlist.ts blocks/playlist.js
bunx openchamber-guest-bundle blocks/login.ts blocks/login.js
bunx openchamber-guest-bundle panel/main.ts panel/main.js
bunx openchamber-guest-bundle --node service/main.ts service/main.js
bunx openchamber-guest-bundle --node plugin/index.ts plugin/index.js
bunx openchamber-guest-check
```

运行时只加载打包后的 `.js`，改完 TS 必须重新 bundle。扩展已添加过的话，重新 bundle 即热重载。

单独跑服务方便调试：

```bash
OPENCHAMBER_SERVICE_PORT=4599 OPENCHAMBER_SERVICE_TOKEN=t node service/main.js &
curl -H 'Authorization: Bearer t' 'localhost:4599/search?q=晴天'
curl -H 'Authorization: Bearer t' 'localhost:4599/playlist?source=@liked'
curl -H 'Authorization: Bearer t' 'localhost:4599/audio?id=7611557268240746513&quality=medium'
```

## 注意

接口来自汽水音乐 App 的公开客户端协议，随时可能变。仅供个人学习使用，请勿用于分发受版权保护的内容。

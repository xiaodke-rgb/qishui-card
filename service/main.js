// service/main.ts
import http from "node:http";

// service/decrypt.ts
import crypto from "node:crypto";
var encryptedBoxTypes = new Set(["senc", "saio", "saiz", "sinf", "schi", "tenc", "schm", "frma"]);
var containerBoxTypes = new Set(["moov", "trak", "mdia", "minf", "stbl"]);
var maxSampleCount = 200000;
var maxChunkCount = 200000;
var maxStscEntryCount = 20000;
function decodeBase36(codePoint) {
  if (codePoint >= 48 && codePoint <= 57)
    return codePoint - 48;
  if (codePoint >= 97 && codePoint <= 122)
    return codePoint - 97 + 10;
  return 255;
}
function bitCount(number) {
  let value = number - (number >> 1 & 1431655765);
  value = (value & 858993459) + (value >> 2 & 858993459);
  return (value + (value >> 4) & 252645135) * 16843009 >> 24;
}
function decryptSpadeInner(spadeKey) {
  const result = new Uint8Array(spadeKey);
  const buffer = new Uint8Array(2 + spadeKey.length);
  buffer.set([250, 85], 0);
  buffer.set(spadeKey, 2);
  for (let index = 0;index < result.length; index += 1) {
    let value = (spadeKey[index] ^ buffer[index]) - bitCount(index) - 21;
    while (value < 0)
      value += 255;
    result[index] = value;
  }
  return result;
}
function decryptSpade(spadeKeyBytes) {
  const spadeKeyLength = spadeKeyBytes.length;
  if (spadeKeyLength < 3)
    return "";
  const paddingLength = (spadeKeyBytes[0] ^ spadeKeyBytes[1] ^ spadeKeyBytes[2]) - 48;
  if (spadeKeyLength < paddingLength + 2)
    return "";
  const innerInput = spadeKeyBytes.slice(1, spadeKeyLength - paddingLength);
  const decodedBuffer = decryptSpadeInner(innerInput);
  if (decodedBuffer.length === 0)
    return "";
  const skipBytes = decodeBase36(decodedBuffer[0]);
  const decodedMessageLength = spadeKeyLength - paddingLength - 2;
  const endIndex = 1 + decodedMessageLength - skipBytes;
  if (endIndex > decodedBuffer.length)
    return "";
  return Buffer.from(decodedBuffer.slice(1, endIndex)).toString("utf8");
}
function decryptSpadeA(spadeA) {
  try {
    return decryptSpade(new Uint8Array(Buffer.from(String(spadeA || "").trim(), "base64")));
  } catch {
    return "";
  }
}
function isHexKey(value) {
  return typeof value === "string" && /^[a-f0-9]{32}$/i.test(value.trim());
}
function hexToBytes(hex) {
  if (!isHexKey(hex))
    throw new Error("hex_key 必须是 32 位十六进制 AES-128 密钥");
  return Buffer.from(hex, "hex");
}
function asUint8Array(input) {
  if (input instanceof Uint8Array)
    return input;
  if (Buffer.isBuffer(input))
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new Error("音频数据必须是 Buffer 或 Uint8Array");
}
function concatUint8Arrays(arrays) {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}
function readUint32BE(fileData, offset) {
  return new DataView(fileData.buffer, fileData.byteOffset, fileData.byteLength).getUint32(offset, false);
}
function writeUint32BE(value) {
  const output = new Uint8Array(4);
  new DataView(output.buffer).setUint32(0, value, false);
  return output;
}
function readAscii(fileData, start, end) {
  return Buffer.from(fileData.subarray(start, end)).toString("ascii");
}

class MP4Box {
  offset;
  size;
  type;
  data;
  constructor(fileData, offset) {
    this.offset = offset;
    this.size = readUint32BE(fileData, offset);
    this.type = readAscii(fileData, offset + 4, offset + 8);
    this.data = fileData.subarray(offset + 8, offset + this.size);
  }
  static findBox(fileData, boxType, offset = 0, end = null) {
    const searchEnd = end === null ? fileData.length : end;
    let position = offset;
    while (position < searchEnd) {
      if (position + 8 > searchEnd)
        break;
      const boxSize = readUint32BE(fileData, position);
      if (boxSize === 0 || boxSize > searchEnd - position || boxSize < 8)
        break;
      if (readAscii(fileData, position + 4, position + 8) === boxType)
        return new MP4Box(fileData, position);
      position += boxSize;
    }
    return null;
  }
}
function requireBox(box, name) {
  if (!box)
    throw new Error(`音频容器缺少 ${name} box`);
  return box;
}
function parseStsz(stszData) {
  const sampleSize = readUint32BE(stszData, 4);
  const sampleCount = readUint32BE(stszData, 8);
  if (sampleCount > maxSampleCount)
    throw new Error("音频样本数量超过限制");
  if (sampleSize !== 0)
    return new Array(sampleCount).fill(sampleSize);
  const sampleSizes = [];
  for (let index = 0;index < sampleCount; index += 1)
    sampleSizes.push(readUint32BE(stszData, 12 + index * 4));
  return sampleSizes;
}
function parseStsc(stscData) {
  const entryCount = readUint32BE(stscData, 4);
  if (entryCount > maxStscEntryCount)
    throw new Error("stsc entry 数量超过限制");
  const entries = [];
  for (let index = 0;index < entryCount; index += 1) {
    const baseOffset = 8 + index * 12;
    entries.push({
      firstChunk: readUint32BE(stscData, baseOffset),
      samplesPerChunk: readUint32BE(stscData, baseOffset + 4),
      id: readUint32BE(stscData, baseOffset + 8)
    });
  }
  return entries;
}
function parseSenc(sencData) {
  const sampleCount = readUint32BE(sencData, 4);
  if (sampleCount > maxSampleCount)
    throw new Error("senc 样本数量超过限制");
  const ivs = [];
  let position = 8;
  for (let index = 0;index < sampleCount; index += 1) {
    const iv = new Uint8Array(16);
    iv.set(sencData.subarray(position, position + 8));
    ivs.push(iv);
    position += 8;
  }
  return ivs;
}
function calculateChunkOffsets(sampleSizes, stscEntries, chunkCount, baseOffset) {
  const offsets = [];
  let currentOffset = baseOffset;
  let sampleIndex = 0;
  for (let chunkIndex = 1;chunkIndex <= chunkCount; chunkIndex += 1) {
    offsets.push(currentOffset);
    let samplesPerChunk = 0;
    for (let entryIndex = 0;entryIndex < stscEntries.length; entryIndex += 1) {
      const currentEntry = stscEntries[entryIndex];
      const nextEntry = stscEntries[entryIndex + 1];
      if (chunkIndex >= currentEntry.firstChunk && (!nextEntry || chunkIndex < nextEntry.firstChunk)) {
        samplesPerChunk = currentEntry.samplesPerChunk;
        break;
      }
    }
    for (let sampleOffset = 0;sampleOffset < samplesPerChunk; sampleOffset += 1) {
      if (sampleIndex < sampleSizes.length)
        currentOffset += sampleSizes[sampleIndex];
      sampleIndex += 1;
    }
  }
  return offsets;
}
function updateStco(stcoData, offsets) {
  const chunkCount = readUint32BE(stcoData, 4);
  if (offsets.length < chunkCount)
    throw new Error("stco 偏移数量不足");
  const header = stcoData.subarray(0, 8);
  const body = new Uint8Array(chunkCount * 4);
  const view = new DataView(body.buffer);
  for (let index = 0;index < chunkCount; index += 1)
    view.setUint32(index * 4, offsets[index], false);
  return concatUint8Arrays([header, body]);
}
var audioEntryHeaderSize = 8 + 8 + 20;
function cleanSampleEntry(fileData, offset, size, context) {
  const fourcc = readAscii(fileData, offset + 4, offset + 8);
  const isEncrypted = fourcc === "enca";
  const entryType = isEncrypted ? Buffer.from("mp4a") : Buffer.from(fourcc, "latin1");
  const headerEnd = Math.min(offset + audioEntryHeaderSize, offset + size);
  const parts = [fileData.subarray(offset + 8, headerEnd)];
  let position = headerEnd;
  const end = offset + size;
  while (position + 8 <= end) {
    const boxSize = readUint32BE(fileData, position);
    if (boxSize < 8 || boxSize > end - position)
      break;
    const type = readAscii(fileData, position + 4, position + 8);
    if (encryptedBoxTypes.has(type) || type === "sinf" || type === "schi") {
      position += boxSize;
      continue;
    }
    parts.push(fileData.subarray(position, position + boxSize));
    position += boxSize;
  }
  if (position < end)
    parts.push(fileData.subarray(position, end));
  const inner = concatUint8Arrays(parts);
  return concatUint8Arrays([writeUint32BE(inner.length + 8), entryType, inner]);
}
function cleanStsd(fileData, offset, size, context) {
  const body = fileData.subarray(offset + 8, offset + size);
  const entryCount = readUint32BE(body, 4);
  const head = new Uint8Array(8);
  head.set(body.subarray(0, 8));
  const entries = [];
  let position = 8;
  for (let index = 0;index < entryCount && position + 8 <= body.length; index += 1) {
    const entrySize = readUint32BE(body, position);
    if (entrySize < 8 || position + entrySize > body.length)
      break;
    const absolute = offset + 8 + position;
    entries.push(cleanSampleEntry(fileData, absolute, entrySize, context));
    position += entrySize;
  }
  if (position < body.length)
    entries.push(body.subarray(position));
  return concatUint8Arrays([writeUint32BE(head.length + entries.reduce((sum, entry) => sum + entry.length, 0) + 8), Buffer.from("stsd"), head, ...entries]);
}
function processBoxTree(fileData, offset, size, newMdatOffset, context) {
  const parts = [];
  let position = offset + 8;
  const end = offset + size;
  while (position < end) {
    if (position + 8 > end) {
      parts.push(fileData.subarray(position, end));
      break;
    }
    const boxSize = readUint32BE(fileData, position);
    if (boxSize < 8 || boxSize > end - position) {
      parts.push(fileData.subarray(position, end));
      break;
    }
    const type = readAscii(fileData, position + 4, position + 8);
    if (encryptedBoxTypes.has(type)) {
      position += boxSize;
      continue;
    }
    if (type === "stsd") {
      parts.push(cleanStsd(fileData, position, boxSize, context));
      position += boxSize;
      continue;
    }
    if (type === "stco") {
      const offsets = calculateChunkOffsets(context.sampleSizes, context.stscEntries, context.chunkCount, newMdatOffset);
      const updatedBody = updateStco(fileData.subarray(position + 8, position + boxSize), offsets);
      parts.push(writeUint32BE(updatedBody.length + 8), Buffer.from("stco"), updatedBody);
      position += boxSize;
      continue;
    }
    if (containerBoxTypes.has(type)) {
      const inner = processBoxTree(fileData, position, boxSize, newMdatOffset, context);
      parts.push(writeUint32BE(inner.length + 8), Buffer.from(type), inner);
      position += boxSize;
      continue;
    }
    parts.push(fileData.subarray(position, position + boxSize));
    position += boxSize;
  }
  return concatUint8Arrays(parts);
}
function scanForFlacMetadata(stsdData) {
  const marker = Buffer.from("dfLa");
  for (let index = 4;index < stsdData.length - 4; index += 1) {
    if (stsdData[index] === marker[0] && stsdData[index + 1] === marker[1] && stsdData[index + 2] === marker[2] && stsdData[index + 3] === marker[3]) {
      const boxSize = readUint32BE(stsdData, index - 4);
      if (boxSize >= 8 && index - 4 + boxSize <= stsdData.length)
        return stsdData.subarray(index + 4, index - 4 + boxSize);
    }
  }
  return null;
}
function decryptCtr(encryptedSample, keyBytes, iv) {
  const decipher = crypto.createDecipheriv(`aes-${keyBytes.length * 8}-ctr`, keyBytes, Buffer.from(iv));
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(Buffer.from(encryptedSample)), decipher.final()]);
}
function decryptAudioBuffer(input, hexKey) {
  const fileData = asUint8Array(input);
  const keyBytes = hexToBytes(hexKey);
  const ftyp = MP4Box.findBox(fileData, "ftyp");
  const moov = requireBox(MP4Box.findBox(fileData, "moov"), "moov");
  const trak = requireBox(MP4Box.findBox(fileData, "trak", moov.offset + 8, moov.offset + moov.size), "trak");
  const mdia = requireBox(MP4Box.findBox(fileData, "mdia", trak.offset + 8, trak.offset + trak.size), "mdia");
  const minf = requireBox(MP4Box.findBox(fileData, "minf", mdia.offset + 8, mdia.offset + mdia.size), "minf");
  const stbl = requireBox(MP4Box.findBox(fileData, "stbl", minf.offset + 8, minf.offset + minf.size), "stbl");
  const stsd = requireBox(MP4Box.findBox(fileData, "stsd", stbl.offset + 8, stbl.offset + stbl.size), "stsd");
  const stsz = requireBox(MP4Box.findBox(fileData, "stsz", stbl.offset + 8, stbl.offset + stbl.size), "stsz");
  const stsc = requireBox(MP4Box.findBox(fileData, "stsc", stbl.offset + 8, stbl.offset + stbl.size), "stsc");
  const stco = requireBox(MP4Box.findBox(fileData, "stco", stbl.offset + 8, stbl.offset + stbl.size), "stco");
  const mdat = requireBox(MP4Box.findBox(fileData, "mdat"), "mdat");
  let senc = MP4Box.findBox(fileData, "senc", stbl.offset + 8, stbl.offset + stbl.size);
  if (!senc)
    senc = MP4Box.findBox(fileData, "senc", moov.offset + 8, moov.offset + moov.size);
  requireBox(senc, "senc");
  const sampleSizes = parseStsz(stsz.data);
  const stscEntries = parseStsc(stsc.data);
  const chunkCount = readUint32BE(stco.data, 4);
  if (chunkCount > maxChunkCount)
    throw new Error("音频 chunk 数量超过限制");
  const ivs = parseSenc(senc.data);
  if (ivs.length < sampleSizes.length)
    throw new Error("senc IV 数量少于样本数量");
  const decryptedSamples = [];
  let sampleOffset = mdat.offset + 8;
  for (let index = 0;index < sampleSizes.length; index += 1) {
    const sampleSize = sampleSizes[index];
    decryptedSamples.push(decryptCtr(fileData.subarray(sampleOffset, sampleOffset + sampleSize), keyBytes, ivs[index]));
    sampleOffset += sampleSize;
  }
  const flacMetadata = scanForFlacMetadata(stsd.data);
  if (flacMetadata) {
    const metadataStart = flacMetadata.length > 4 ? 4 : 0;
    return {
      buffer: Buffer.from(concatUint8Arrays([Buffer.from("fLaC"), flacMetadata.subarray(metadataStart), ...decryptedSamples])),
      extension: ".flac",
      content_type: "audio/flac",
      sample_count: sampleSizes.length
    };
  }
  const context = { sampleSizes, stscEntries, chunkCount };
  const ftypSize = ftyp ? ftyp.size : 0;
  const dummyMoov = processBoxTree(fileData, moov.offset, moov.size, 0, context);
  const newMdatOffset = ftypSize + dummyMoov.length + 16;
  const cleanMoovData = processBoxTree(fileData, moov.offset, moov.size, newMdatOffset, context);
  const cleanMoov = concatUint8Arrays([writeUint32BE(cleanMoovData.length + 8), Buffer.from("moov"), cleanMoovData]);
  const mdatData = concatUint8Arrays(decryptedSamples);
  const newMdat = concatUint8Arrays([writeUint32BE(mdatData.length + 8), Buffer.from("mdat"), mdatData]);
  const finalParts = [];
  if (ftyp)
    finalParts.push(fileData.subarray(ftyp.offset, ftyp.offset + ftyp.size));
  finalParts.push(cleanMoov, newMdat);
  return {
    buffer: Buffer.from(concatUint8Arrays(finalParts)),
    extension: ".m4a",
    content_type: "audio/mp4",
    sample_count: sampleSizes.length
  };
}

// service/main.ts
var COMMON = {
  aid: "765213",
  app_id: "765213",
  app_name: "byte_autoservice_lite",
  version_code: "100010",
  version_name: "1.0.10",
  channel: "bydSong",
  sdk_aid: "753999",
  caller_name: "luna_open_sdk",
  sdk_version_code: "100000100",
  sdk_version_name: "0.0.1",
  sdk_channel: "Test",
  vehicle_type: "BYD",
  device_brand: "BYD",
  device_type: "BYD",
  device_platform: "android",
  resolution: "1920x1080",
  os_version: "13",
  ac: "wifi"
};
var DEVICE_ID = "1234567890123456789";
var UA = "LunaOpenSDK/1.0.10";
var PREFIX = "/api/luna/v1/platform";
var params = () => {
  const query = new URLSearchParams({
    ...COMMON,
    device_id: DEVICE_ID,
    did: DEVICE_ID,
    iid: DEVICE_ID,
    vehicle_id: `qishui-${DEVICE_ID}`,
    _timestamp: String(Math.floor(Date.now() / 1000)),
    _nonce: String(Math.floor(Math.random() * 1e6))
  });
  return query.toString();
};
var token = "";
var tokenAt = 0;
var clientToken = async () => {
  if (token && Date.now() - tokenAt < 10 * 60 * 1000)
    return token;
  const res = await fetch(`https://open.qishui.com${PREFIX}/client/token/get/?trigger_type=cold_start&${params()}`, { headers: { "user-agent": UA } });
  const body = await res.json();
  if (!body.client_token)
    throw new Error("汽水取 token 失败");
  token = body.client_token;
  tokenAt = Date.now();
  return token;
};
var platformPost = async (path, payload) => {
  const res = await fetch(`https://open.douyin.com${PREFIX}${path}/?${params()}`, {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/json", "access-token": await clientToken() },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`汽水接口 ${res.status}`);
  const body = JSON.parse(text);
  const code = body?.err_no ?? body?.data?.error_code ?? 0;
  if (code) {
    token = "";
    throw new Error(`汽水接口返回 ${code}: ${body?.err_msg ?? ""}`);
  }
  return body;
};
var trackOf = (item) => item?.entity?.track ?? item?.track ?? null;
var coverUrl = (track) => {
  const cover = track?.display_info?.cover_url;
  const base = cover?.urls?.[0];
  if (!base || !cover?.uri)
    return "";
  return `${base}${cover.uri}~c5_375x375.jpg`;
};
var asDataUrl = async (url) => {
  if (!url)
    return "";
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok)
      return "";
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 400000)
      return "";
    return `data:${type.split(";")[0]};base64,${bytes.toString("base64")}`;
  } catch {
    return "";
  }
};
var hitsOf = async (entities) => {
  const tracks = entities.map(trackOf).filter(Boolean);
  return Promise.all(tracks.slice(0, 8).map(async (track) => {
    const isFree = String(track?.commerce_info?.playable_condition ?? "") === "1 == 1";
    const full = track?.player_info?.full;
    const hasFull = isFree && !!full?.video_model_info?.video_model;
    return {
      id: String(track?.base_info?.id ?? ""),
      title: String(track?.base_info?.name ?? ""),
      artist: (track?.related_info?.artist_links ?? []).map((a) => a?.name).filter(Boolean).join(" / "),
      duration: Number(track?.base_info?.duration_ms ?? 0),
      cover: hasFull ? await asDataUrl(coverUrl(track)) : "",
      playable: hasFull
    };
  }));
};
var searchCache = { key: "", at: 0, hits: [] };
var search = async (q) => {
  if (searchCache.key === q && Date.now() - searchCache.at < 10 * 60 * 1000)
    return searchCache.hits;
  const body = await platformPost("/search/", {
    q,
    cursor: 0,
    search_id: "openchamber",
    from_search_id: "openchamber",
    search_method: "input",
    search_type: "track",
    search_scene: "normal",
    scene_name: "search",
    ab_param: "",
    last_viewed_media: {}
  });
  const entities = (body?.data?.result_groups ?? []).flatMap((group) => group?.data ?? []);
  const hits = await hitsOf(entities);
  searchCache = { key: q, at: Date.now(), hits };
  return hits;
};
var AUDIO_MAX = 6000000;
var audioCache = { key: "", at: 0, audio: { dataUrl: "", mime: "", size: 0 } };
var audio = async (id, quality) => {
  const key = `${id}:${quality}`;
  if (audioCache.key === key && Date.now() - audioCache.at < 10 * 60 * 1000)
    return audioCache.audio;
  const body = await platformPost("/media/mget/", { media_list: [{ id, type: "track" }] });
  const track = body?.data?.media_list?.[0]?.track_entity;
  if (!track)
    throw new Error("找不到这首歌");
  const full = track?.player_info?.full;
  const model = full?.video_model_info?.video_model;
  if (!model)
    throw new Error("这首歌需要会员才能播放");
  const parsed = JSON.parse(String(model));
  const list = (parsed?.video_list ?? []).filter((item) => item?.main_url && item?.video_meta?.size);
  const pick = list.find((item) => item?.video_meta?.quality === quality) ?? list[0];
  if (!pick)
    throw new Error("这首歌没有可播地址");
  if (Number(pick.video_meta.size) > AUDIO_MAX)
    throw new Error("音质过大，换低一档");
  const encInfo = pick.encrypt_info ?? {};
  let bytes;
  if (encInfo.encrypt) {
    const hexKey = isHexKey(encInfo.hex_key) ? encInfo.hex_key : decryptSpadeA(String(encInfo.spade_a ?? ""));
    if (!isHexKey(hexKey))
      throw new Error("解密密钥无效");
    const encRes = await fetch(pick.main_url, { headers: { "user-agent": UA } });
    if (!encRes.ok)
      throw new Error(`音频下载失败 ${encRes.status}`);
    bytes = decryptAudioBuffer(Buffer.from(await encRes.arrayBuffer()), hexKey).buffer;
  } else {
    const plain = await fetch(pick.main_url, { headers: { "user-agent": UA } });
    if (!plain.ok)
      throw new Error(`音频下载失败 ${plain.status}`);
    bytes = Buffer.from(await plain.arrayBuffer());
  }
  const sniff = bytes.subarray(4, 8).toString("ascii") === "ftyp" ? bytes.subarray(8, 12).toString("ascii") === "fLaC" ? "audio/flac" : "audio/mp4" : "audio/mpeg";
  const result = { dataUrl: `data:${sniff};base64,${bytes.toString("base64")}`, mime: sniff, size: bytes.length };
  audioCache = { key, at: Date.now(), audio: result };
  return result;
};
var token_ = process.env.OPENCHAMBER_SERVICE_TOKEN;
var answer = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(body));
};
http.createServer((req, res) => {
  if (req.headers.authorization !== `Bearer ${token_}`) {
    res.writeHead(401).end();
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    answer(res, 200, { ok: true });
    return;
  }
  if (url.pathname === "/search") {
    const q = (url.searchParams.get("q") ?? "").trim();
    if (!q) {
      answer(res, 200, { results: [] });
      return;
    }
    search(q).then((results) => answer(res, 200, { results })).catch((error) => answer(res, 200, { results: [], error: error.message }));
    return;
  }
  if (url.pathname === "/audio") {
    const id = (url.searchParams.get("id") ?? "").trim();
    const quality = url.searchParams.get("quality") ?? "higher";
    if (!id) {
      answer(res, 200, { error: "缺少歌曲 id" });
      return;
    }
    audio(id, quality).then((result) => answer(res, 200, result)).catch((error) => answer(res, 200, { error: error.message }));
    return;
  }
  answer(res, 404, { error: "not found" });
}).listen(Number(process.env.OPENCHAMBER_SERVICE_PORT), "127.0.0.1");

import crypto from 'node:crypto';

// Port of guowenye/qishui-api src/audioDecryptor.js (cenc-aes-ctr spade key).

const encryptedBoxTypes = new Set(['senc', 'saio', 'saiz', 'sinf', 'schi', 'tenc', 'schm', 'frma']);
const containerBoxTypes = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl']);
const maxSampleCount = 200000;
const maxChunkCount = 200000;
const maxStscEntryCount = 20000;

function decodeBase36(codePoint: number): number {
  if (codePoint >= 48 && codePoint <= 57) return codePoint - 48;
  if (codePoint >= 97 && codePoint <= 122) return codePoint - 97 + 10;
  return 0xff;
}

function bitCount(number: number): number {
  let value = number - ((number >> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
  return (((value + (value >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

function decryptSpadeInner(spadeKey: Uint8Array): Uint8Array {
  const result = new Uint8Array(spadeKey);
  const buffer = new Uint8Array(2 + spadeKey.length);
  buffer.set([0xfa, 0x55], 0);
  buffer.set(spadeKey, 2);
  for (let index = 0; index < result.length; index += 1) {
    let value = (spadeKey[index] ^ buffer[index]) - bitCount(index) - 21;
    while (value < 0) value += 0xff;
    result[index] = value;
  }
  return result;
}

function decryptSpade(spadeKeyBytes: Uint8Array): string {
  const spadeKeyLength = spadeKeyBytes.length;
  if (spadeKeyLength < 3) return '';
  const paddingLength = (spadeKeyBytes[0] ^ spadeKeyBytes[1] ^ spadeKeyBytes[2]) - 48;
  if (spadeKeyLength < paddingLength + 2) return '';
  const innerInput = spadeKeyBytes.slice(1, spadeKeyLength - paddingLength);
  const decodedBuffer = decryptSpadeInner(innerInput);
  if (decodedBuffer.length === 0) return '';
  const skipBytes = decodeBase36(decodedBuffer[0]);
  const decodedMessageLength = spadeKeyLength - paddingLength - 2;
  const endIndex = 1 + decodedMessageLength - skipBytes;
  if (endIndex > decodedBuffer.length) return '';
  return Buffer.from(decodedBuffer.slice(1, endIndex)).toString('utf8');
}

export function decryptSpadeA(spadeA: string): string {
  try {
    return decryptSpade(new Uint8Array(Buffer.from(String(spadeA || '').trim(), 'base64')));
  } catch {
    return '';
  }
}

export function isHexKey(value: unknown): boolean {
  return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value.trim());
}

function hexToBytes(hex: string): Buffer {
  if (!isHexKey(hex)) throw new Error('hex_key 必须是 32 位十六进制 AES-128 密钥');
  return Buffer.from(hex, 'hex');
}

function asUint8Array(input: Buffer | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (Buffer.isBuffer(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new Error('音频数据必须是 Buffer 或 Uint8Array');
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

function readUint32BE(fileData: Uint8Array, offset: number): number {
  return new DataView(fileData.buffer, fileData.byteOffset, fileData.byteLength).getUint32(offset, false);
}

function writeUint32BE(value: number): Uint8Array {
  const output = new Uint8Array(4);
  new DataView(output.buffer).setUint32(0, value, false);
  return output;
}

function readAscii(fileData: Uint8Array, start: number, end: number): string {
  return Buffer.from(fileData.subarray(start, end)).toString('ascii');
}

class MP4Box {
  offset: number;
  size: number;
  type: string;
  data: Uint8Array;

  constructor(fileData: Uint8Array, offset: number) {
    this.offset = offset;
    this.size = readUint32BE(fileData, offset);
    this.type = readAscii(fileData, offset + 4, offset + 8);
    this.data = fileData.subarray(offset + 8, offset + this.size);
  }

  static findBox(fileData: Uint8Array, boxType: string, offset = 0, end: number | null = null): MP4Box | null {
    const searchEnd = end === null ? fileData.length : end;
    let position = offset;
    while (position < searchEnd) {
      if (position + 8 > searchEnd) break;
      const boxSize = readUint32BE(fileData, position);
      if (boxSize === 0 || boxSize > searchEnd - position || boxSize < 8) break;
      if (readAscii(fileData, position + 4, position + 8) === boxType) return new MP4Box(fileData, position);
      position += boxSize;
    }
    return null;
  }
}

function requireBox(box: MP4Box | null, name: string): MP4Box {
  if (!box) throw new Error(`音频容器缺少 ${name} box`);
  return box;
}

function parseStsz(stszData: Uint8Array): number[] {
  const sampleSize = readUint32BE(stszData, 4);
  const sampleCount = readUint32BE(stszData, 8);
  if (sampleCount > maxSampleCount) throw new Error('音频样本数量超过限制');
  if (sampleSize !== 0) return new Array(sampleCount).fill(sampleSize);
  const sampleSizes: number[] = [];
  for (let index = 0; index < sampleCount; index += 1) sampleSizes.push(readUint32BE(stszData, 12 + index * 4));
  return sampleSizes;
}

function parseStsc(stscData: Uint8Array): { firstChunk: number; samplesPerChunk: number; id: number }[] {
  const entryCount = readUint32BE(stscData, 4);
  if (entryCount > maxStscEntryCount) throw new Error('stsc entry 数量超过限制');
  const entries = [];
  for (let index = 0; index < entryCount; index += 1) {
    const baseOffset = 8 + index * 12;
    entries.push({
      firstChunk: readUint32BE(stscData, baseOffset),
      samplesPerChunk: readUint32BE(stscData, baseOffset + 4),
      id: readUint32BE(stscData, baseOffset + 8),
    });
  }
  return entries;
}

function parseSenc(sencData: Uint8Array): Uint8Array[] {
  const sampleCount = readUint32BE(sencData, 4);
  if (sampleCount > maxSampleCount) throw new Error('senc 样本数量超过限制');
  const ivs: Uint8Array[] = [];
  let position = 8;
  for (let index = 0; index < sampleCount; index += 1) {
    const iv = new Uint8Array(16);
    iv.set(sencData.subarray(position, position + 8));
    ivs.push(iv);
    position += 8;
  }
  return ivs;
}

function calculateChunkOffsets(sampleSizes: number[], stscEntries: { firstChunk: number; samplesPerChunk: number }[], chunkCount: number, baseOffset: number): number[] {
  const offsets: number[] = [];
  let currentOffset = baseOffset;
  let sampleIndex = 0;
  for (let chunkIndex = 1; chunkIndex <= chunkCount; chunkIndex += 1) {
    offsets.push(currentOffset);
    let samplesPerChunk = 0;
    for (let entryIndex = 0; entryIndex < stscEntries.length; entryIndex += 1) {
      const currentEntry = stscEntries[entryIndex];
      const nextEntry = stscEntries[entryIndex + 1];
      if (chunkIndex >= currentEntry.firstChunk && (!nextEntry || chunkIndex < nextEntry.firstChunk)) {
        samplesPerChunk = currentEntry.samplesPerChunk;
        break;
      }
    }
    for (let sampleOffset = 0; sampleOffset < samplesPerChunk; sampleOffset += 1) {
      if (sampleIndex < sampleSizes.length) currentOffset += sampleSizes[sampleIndex];
      sampleIndex += 1;
    }
  }
  return offsets;
}

function updateStco(stcoData: Uint8Array, offsets: number[]): Uint8Array {
  const chunkCount = readUint32BE(stcoData, 4);
  if (offsets.length < chunkCount) throw new Error('stco 偏移数量不足');
  const header = stcoData.subarray(0, 8);
  const body = new Uint8Array(chunkCount * 4);
  const view = new DataView(body.buffer);
  for (let index = 0; index < chunkCount; index += 1) view.setUint32(index * 4, offsets[index], false);
  return concatUint8Arrays([header, body]);
}

type TreeContext = {
  sampleSizes: number[];
  stscEntries: { firstChunk: number; samplesPerChunk: number; id: number }[];
  chunkCount: number;
};

// 样本条目不是普通 box：stsd 里先是 version/flags + 条目数，条目本身是
// (大小, 类型, 6 字节保留, 2 字节 dref, 音频字段 20 字节)，之后才是子 box。
// Apple 的解码器不接受仍带 enca/sinf/tenc 的条目，所以要把 enca 改成 mp4a 并剥掉加密子 box。
const audioEntryHeaderSize = 8 + 8 + 20;

function cleanSampleEntry(fileData: Uint8Array, offset: number, size: number, context: TreeContext): Uint8Array {
  const fourcc = readAscii(fileData, offset + 4, offset + 8);
  const isEncrypted = fourcc === 'enca';
  const entryType = isEncrypted ? Buffer.from('mp4a') : Buffer.from(fourcc, 'latin1');
  const headerEnd = Math.min(offset + audioEntryHeaderSize, offset + size);
  const parts: Uint8Array[] = [fileData.subarray(offset + 8, headerEnd)];

  let position = headerEnd;
  const end = offset + size;
  while (position + 8 <= end) {
    const boxSize = readUint32BE(fileData, position);
    if (boxSize < 8 || boxSize > end - position) break;
    const type = readAscii(fileData, position + 4, position + 8);
    if (encryptedBoxTypes.has(type) || type === 'sinf' || type === 'schi') {
      position += boxSize;
      continue;
    }
    parts.push(fileData.subarray(position, position + boxSize));
    position += boxSize;
  }
  if (position < end) parts.push(fileData.subarray(position, end));

  const inner = concatUint8Arrays(parts);
  return concatUint8Arrays([writeUint32BE(inner.length + 8), entryType, inner]);
}

function cleanStsd(fileData: Uint8Array, offset: number, size: number, context: TreeContext): Uint8Array {
  const body = fileData.subarray(offset + 8, offset + size);
  const entryCount = readUint32BE(body, 4);
  const head = new Uint8Array(8);
  head.set(body.subarray(0, 8));
  const entries: Uint8Array[] = [];
  let position = 8;
  for (let index = 0; index < entryCount && position + 8 <= body.length; index += 1) {
    const entrySize = readUint32BE(body, position);
    if (entrySize < 8 || position + entrySize > body.length) break;
    const absolute = offset + 8 + position;
    entries.push(cleanSampleEntry(fileData, absolute, entrySize, context));
    position += entrySize;
  }
  if (position < body.length) entries.push(body.subarray(position));
  return concatUint8Arrays([writeUint32BE(head.length + entries.reduce((sum, entry) => sum + entry.length, 0) + 8), Buffer.from('stsd'), head, ...entries]);
}

function processBoxTree(fileData: Uint8Array, offset: number, size: number, newMdatOffset: number, context: TreeContext): Uint8Array {
  const parts: Uint8Array[] = [];
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

    if (type === 'stsd') {
      parts.push(cleanStsd(fileData, position, boxSize, context));
      position += boxSize;
      continue;
    }

    if (type === 'stco') {
      const offsets = calculateChunkOffsets(context.sampleSizes, context.stscEntries, context.chunkCount, newMdatOffset);
      const updatedBody = updateStco(fileData.subarray(position + 8, position + boxSize), offsets);
      parts.push(writeUint32BE(updatedBody.length + 8), Buffer.from('stco'), updatedBody);
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

function scanForFlacMetadata(stsdData: Uint8Array): Uint8Array | null {
  const marker = Buffer.from('dfLa');
  for (let index = 4; index < stsdData.length - 4; index += 1) {
    if (
      stsdData[index] === marker[0] &&
      stsdData[index + 1] === marker[1] &&
      stsdData[index + 2] === marker[2] &&
      stsdData[index + 3] === marker[3]
    ) {
      const boxSize = readUint32BE(stsdData, index - 4);
      if (boxSize >= 8 && index - 4 + boxSize <= stsdData.length) return stsdData.subarray(index + 4, index - 4 + boxSize);
    }
  }
  return null;
}

function decryptCtr(encryptedSample: Uint8Array, keyBytes: Buffer, iv: Uint8Array): Buffer {
  const decipher = crypto.createDecipheriv(`aes-${keyBytes.length * 8}-ctr`, keyBytes, Buffer.from(iv));
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(Buffer.from(encryptedSample)), decipher.final()]);
}

export function decryptAudioBuffer(input: Buffer | Uint8Array, hexKey: string): { buffer: Buffer; extension: string; content_type: string; sample_count: number } {
  const fileData = asUint8Array(input);
  const keyBytes = hexToBytes(hexKey);

  const ftyp = MP4Box.findBox(fileData, 'ftyp');
  const moov = requireBox(MP4Box.findBox(fileData, 'moov'), 'moov');
  const trak = requireBox(MP4Box.findBox(fileData, 'trak', moov.offset + 8, moov.offset + moov.size), 'trak');
  const mdia = requireBox(MP4Box.findBox(fileData, 'mdia', trak.offset + 8, trak.offset + trak.size), 'mdia');
  const minf = requireBox(MP4Box.findBox(fileData, 'minf', mdia.offset + 8, mdia.offset + mdia.size), 'minf');
  const stbl = requireBox(MP4Box.findBox(fileData, 'stbl', minf.offset + 8, minf.offset + minf.size), 'stbl');
  const stsd = requireBox(MP4Box.findBox(fileData, 'stsd', stbl.offset + 8, stbl.offset + stbl.size), 'stsd');
  const stsz = requireBox(MP4Box.findBox(fileData, 'stsz', stbl.offset + 8, stbl.offset + stbl.size), 'stsz');
  const stsc = requireBox(MP4Box.findBox(fileData, 'stsc', stbl.offset + 8, stbl.offset + stbl.size), 'stsc');
  const stco = requireBox(MP4Box.findBox(fileData, 'stco', stbl.offset + 8, stbl.offset + stbl.size), 'stco');
  const mdat = requireBox(MP4Box.findBox(fileData, 'mdat'), 'mdat');

  let senc = MP4Box.findBox(fileData, 'senc', stbl.offset + 8, stbl.offset + stbl.size);
  if (!senc) senc = MP4Box.findBox(fileData, 'senc', moov.offset + 8, moov.offset + moov.size);
  requireBox(senc, 'senc');

  const sampleSizes = parseStsz(stsz.data);
  const stscEntries = parseStsc(stsc.data);
  const chunkCount = readUint32BE(stco.data, 4);
  if (chunkCount > maxChunkCount) throw new Error('音频 chunk 数量超过限制');
  const ivs = parseSenc(senc.data);
  if (ivs.length < sampleSizes.length) throw new Error('senc IV 数量少于样本数量');

  const decryptedSamples: Buffer[] = [];
  let sampleOffset = mdat.offset + 8;
  for (let index = 0; index < sampleSizes.length; index += 1) {
    const sampleSize = sampleSizes[index];
    decryptedSamples.push(decryptCtr(fileData.subarray(sampleOffset, sampleOffset + sampleSize), keyBytes, ivs[index]));
    sampleOffset += sampleSize;
  }

  const flacMetadata = scanForFlacMetadata(stsd.data);
  if (flacMetadata) {
    const metadataStart = flacMetadata.length > 4 ? 4 : 0;
    return {
      buffer: Buffer.from(concatUint8Arrays([Buffer.from('fLaC'), flacMetadata.subarray(metadataStart), ...decryptedSamples])),
      extension: '.flac',
      content_type: 'audio/flac',
      sample_count: sampleSizes.length,
    };
  }

  const context = { sampleSizes, stscEntries, chunkCount };
  const ftypSize = ftyp ? ftyp.size : 0;
  const dummyMoov = processBoxTree(fileData, moov.offset, moov.size, 0, context);
  const newMdatOffset = ftypSize + dummyMoov.length + 16;
  const cleanMoovData = processBoxTree(fileData, moov.offset, moov.size, newMdatOffset, context);
  const cleanMoov = concatUint8Arrays([writeUint32BE(cleanMoovData.length + 8), Buffer.from('moov'), cleanMoovData]);
  const mdatData = concatUint8Arrays(decryptedSamples);
  const newMdat = concatUint8Arrays([writeUint32BE(mdatData.length + 8), Buffer.from('mdat'), mdatData]);
  const finalParts: Uint8Array[] = [];
  if (ftyp) finalParts.push(fileData.subarray(ftyp.offset, ftyp.offset + ftyp.size));
  finalParts.push(cleanMoov, newMdat);

  return {
    buffer: Buffer.from(concatUint8Arrays(finalParts)),
    extension: '.m4a',
    content_type: 'audio/mp4',
    sample_count: sampleSizes.length,
  };
}

// 音檔前處理：解碼 → 降頻為 16kHz 單聲道 → 依時間切成多段 WAV。
// 每段需經 Vercel 後端代理轉送，Hobby 方案單次請求 body 上限約 4.5MB；
// 16kHz/16-bit/mono 每秒約 32KB，故以 90 秒為一段（約 2.9MB）安全落在上限內，
// 並支援任意長度的會議音檔。

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_SECONDS = 90;

export interface AudioChunk {
  blob: Blob;
  index: number;
  total: number;
  startSec: number;
}

/** 將 File 解碼成 AudioBuffer（交由瀏覽器解 mp3/wav/m4a…） */
async function decodeFile(file: File): Promise<AudioBuffer> {
  const arrayBuf = await file.arrayBuffer();
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new Ctx();
  try {
    return await ctx.decodeAudioData(arrayBuf.slice(0));
  } finally {
    void ctx.close();
  }
}

/** 以線性內插將多聲道混音並重採樣為 16kHz 單聲道 Float32 */
function toMono16k(buffer: AudioBuffer): Float32Array {
  const chCount = buffer.numberOfChannels;
  const srcLen = buffer.length;
  const srcRate = buffer.sampleRate;

  // 先混音成單聲道
  const mono = new Float32Array(srcLen);
  for (let ch = 0; ch < chCount; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < srcLen; i++) mono[i] += data[i] / chCount;
  }

  if (srcRate === TARGET_SAMPLE_RATE) return mono;

  const ratio = srcRate / TARGET_SAMPLE_RATE;
  const outLen = Math.floor(srcLen / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, srcLen - 1);
    const frac = pos - i0;
    out[i] = mono[i0] * (1 - frac) + mono[i1] * frac;
  }
  return out;
}

/** 把一段 Float32 PCM 編成 16-bit WAV Blob */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample; // mono
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

/**
 * 前處理單一音檔：回傳可直接送 Whisper 的 WAV 分段陣列。
 * onProgress 回報「解碼/切段」階段的百分比。
 */
export async function prepareAudio(file: File): Promise<AudioChunk[]> {
  const buffer = await decodeFile(file);
  const mono = toMono16k(buffer);

  const chunkLen = CHUNK_SECONDS * TARGET_SAMPLE_RATE;
  const total = Math.max(1, Math.ceil(mono.length / chunkLen));
  const chunks: AudioChunk[] = [];

  for (let c = 0; c < total; c++) {
    const start = c * chunkLen;
    const end = Math.min(start + chunkLen, mono.length);
    const slice = mono.subarray(start, end);
    chunks.push({
      blob: encodeWav(slice, TARGET_SAMPLE_RATE),
      index: c,
      total,
      startSec: c * CHUNK_SECONDS,
    });
  }
  return chunks;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

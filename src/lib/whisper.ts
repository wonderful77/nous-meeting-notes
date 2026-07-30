import { prepareAudio, type AudioChunk } from "./audio";

export interface TranscribeProgress {
  stage: "decoding" | "transcribing";
  fileName: string;
  chunkIndex: number;
  chunkTotal: number;
}

// 走同源後端代理，金鑰由 Vercel 環境變數持有
const PROXY_URL = "/api/transcribe";

async function transcribeChunk(
  chunk: AudioChunk,
  model: string,
  language: string
): Promise<string> {
  const params = new URLSearchParams({ model });
  if (language) params.set("language", language);

  const res = await fetch(`${PROXY_URL}?${params.toString()}`, {
    method: "POST",
    headers: { "content-type": "audio/wav" },
    body: chunk.blob,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Whisper 轉錄失敗（HTTP ${res.status}）：${detail.slice(0, 300)}`
    );
  }
  return (await res.text()).trim();
}

/** 轉錄單一檔案（自動分段、逐段串接） */
export async function transcribeFile(
  file: File,
  opts: { model: string; language: string },
  onProgress?: (p: TranscribeProgress) => void
): Promise<string> {
  onProgress?.({
    stage: "decoding",
    fileName: file.name,
    chunkIndex: 0,
    chunkTotal: 1,
  });
  const chunks = await prepareAudio(file);

  const parts: string[] = [];
  for (const chunk of chunks) {
    onProgress?.({
      stage: "transcribing",
      fileName: file.name,
      chunkIndex: chunk.index + 1,
      chunkTotal: chunk.total,
    });
    const text = await transcribeChunk(chunk, opts.model, opts.language);
    if (text) parts.push(text);
  }
  return parts.join("\n");
}

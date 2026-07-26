import { prepareAudio, type AudioChunk } from "./audio";

export interface TranscribeProgress {
  stage: "decoding" | "transcribing";
  fileName: string;
  chunkIndex: number;
  chunkTotal: number;
}

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";

async function transcribeChunk(
  chunk: AudioChunk,
  apiKey: string,
  model: string,
  language: string
): Promise<string> {
  const form = new FormData();
  form.append("file", chunk.blob, `chunk-${chunk.index}.wav`);
  form.append("model", model);
  if (language) form.append("language", language);
  form.append("response_format", "text");
  // 提示模型這是中文會議，提升專有名詞/口語辨識
  form.append(
    "prompt",
    "這是一段中文會議錄音，內容包含影視製作、腳本、拍攝、造型、時程與分工討論。"
  );

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
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
  opts: { apiKey: string; model: string; language: string },
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
    const text = await transcribeChunk(
      chunk,
      opts.apiKey,
      opts.model,
      opts.language
    );
    if (text) parts.push(text);
  }
  return parts.join("\n");
}

// Vercel 無伺服器函式：代理 OpenAI Whisper 轉錄。
// 瀏覽器把單段 WAV 以原始二進位 POST 過來，金鑰只存在環境變數 OPENAI_API_KEY。
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "伺服器未設定 OPENAI_API_KEY 環境變數" });
    return;
  }

  try {
    // 讀取原始 body（audio/wav）
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);

    const model = (req.query.model || "whisper-1").toString();
    const language = (req.query.language || "").toString();

    const form = new FormData();
    form.append("file", new Blob([buf], { type: "audio/wav" }), "audio.wav");
    form.append("model", model);
    if (language) form.append("language", language);
    form.append("response_format", "text");
    form.append(
      "prompt",
      "這是一段中文會議錄音，內容包含影視製作、腳本、拍攝、造型、時程與分工討論。"
    );

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}

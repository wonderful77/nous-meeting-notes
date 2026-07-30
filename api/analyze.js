// Vercel 無伺服器函式：代理 Anthropic Claude messages API。
// 金鑰只存在環境變數 ANTHROPIC_API_KEY。
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "伺服器未設定 ANTHROPIC_API_KEY 環境變數" });
    return;
  }

  try {
    // Vercel 已解析 application/json → req.body 為物件；保險起見容錯字串
    const payload =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    res.status(r.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}

# 會議記錄 · NOUS 語音會議記錄工具

導入會議語音 → Whisper 轉錄逐字稿 → Claude 依 NOUS 整理原則去蕪存菁 → 一鍵匯出公版 `.docx` 會議記錄。

純前端靜態網站，可直接部署到 GitHub Pages。所有 API 金鑰只存在使用者瀏覽器的 `localStorage`，不經過任何後端伺服器。

## 功能

- **語音轉錄**：上傳 mp3 / wav / m4a 等音檔，前端自動降頻為 16kHz 單聲道並切段，繞過 Whisper 25MB 單檔上限，支援任意長度會議。
- **AI 整理**：Claude 內建 NOUS 逐字稿整理原則（先分類再落筆、三層去重、待辦寫法、客戶要求表、資訊衝突以手打筆記為準）。
- **公版套用**：直接操作官方 `.docx` 模板的 OOXML，保留 PingFang TC 字型、合併儲存格與框線，自動增列 / 移除多餘樣板列。
- **表單預設**：PM（Lily、Barry、盛霓）、實習生（萬德佛、宏奕、躍達）多選，可自訂新增。
- **手打筆記欄位**：作為整理參考，與逐字稿衝突時優先採用。
- **可編輯預覽**：匯出前可逐區塊微調 Claude 產出的內容。

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build      # 產出 dist/
```

`vite.config.ts` 的 `base: "./"` 使用相對路徑，適用任何靜態託管的根目錄或子路徑。

## 部署（私有倉庫）

GitHub Pages 免費方案不支援私有倉庫，故改用支援私有 repo 的免費靜態平台。倉庫已附好設定檔，於平台網頁「Import / Add project」選此 repo 即會自動偵測：

- **Vercel**：`vercel.json`（framework: vite，build `npm run build`，output `dist`）。
- **Netlify**：`netlify.toml`（build `npm run build`，publish `dist`）。
- **Cloudflare Pages**：build command `npm run build`，output directory `dist`。

首次需在平台授權 GitHub App 存取此私有倉庫；之後每次 push 到 `main` 會自動重新部署。

> 若日後改為公開倉庫，也可用 `npm run deploy` 以 `gh-pages` 分支發佈到 GitHub Pages。

## 設定

首次使用點右上角「設定」，填入：

- **OpenAI API Key**：Whisper 語音轉文字。
- **Claude API Key**：會議記錄整理。
- Whisper / Claude 模型名稱可自行調整（若金鑰對應較新版本）。

## 檔名規則

```
【案名】_YYYY.MM.DD_內部會議記錄（副標）.docx
【案名】_YYYY.MM.DD_外部會議記錄（副標）.docx
```

## 技術

React 18 · TypeScript · Vite · Tailwind CSS · PizZip（瀏覽器端 OOXML 操作）

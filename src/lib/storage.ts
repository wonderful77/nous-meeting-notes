import type { AppSettings } from "../types";

const KEY = "yijilu.settings.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  openaiKey: "",
  claudeKey: "",
  whisperModel: "whisper-1",
  // 預設僅供參考；模型名稱會隨版本淘汰，請在設定頁按「載入可用模型」取得目前可用清單
  claudeModel: "claude-sonnet-4-5",
  language: "zh",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// ---- 會議表單草稿（避免重整流失） ----
const DRAFT_KEY = "yijilu.draft.v1";

export function loadDraft<T>(): Partial<T> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(draft: T) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

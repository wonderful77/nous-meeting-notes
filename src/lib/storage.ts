import type { AppSettings } from "../types";

const KEY = "yijilu.settings.v1";

// 金鑰不再放前端；由 Vercel 後端代理（環境變數）處理。
export const DEFAULT_SETTINGS: AppSettings = {
  whisperModel: "whisper-1",
  claudeModel: "claude-sonnet-4-6",
  language: "zh",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    // 只讓「非空」的儲存值覆蓋預設，確保內嵌金鑰／模型不會被舊的空值蓋掉
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== "" && v != null)
    );
    return { ...DEFAULT_SETTINGS, ...clean };
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

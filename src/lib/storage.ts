import type { AppSettings } from "../types";

const KEY = "yijilu.settings.v1";

// 內嵌金鑰：純個人使用，額度有限、外流可接受（使用者明確同意）。
// 仍可在設定頁覆蓋為自己的金鑰。
export const DEFAULT_SETTINGS: AppSettings = {
  openaiKey:
    "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",
  claudeKey:
    "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",
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

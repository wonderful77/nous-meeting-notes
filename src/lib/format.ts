import type { MeetingMeta } from "../types";

/** 2026-07-26 → 2026 年 07 月 26 日 */
export function formatDateChinese(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]} 年 ${m[2]} 月 ${m[3]} 日`;
}

/** 22:00 + 22:30 → 22：00 ～ 22：30（全形冒號，貼合公版樣式） */
export function formatTimeRange(start: string, end: string): string {
  const f = (t: string) => t.replace(":", "：");
  if (!start && !end) return "";
  if (!end) return f(start);
  return `${f(start)} ～ ${f(end)}`;
}

/** 2026-07-26 → 2026.07.26（檔名用） */
export function dateForFilename(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

/**
 * 產生交付檔名，格式固定：
 * 【案名】_YYYY.MM.DD_內部會議記錄（副標）.docx
 * 【案名】_YYYY.MM.DD_外部會議記錄（副標）.docx
 */
export function buildFilename(meta: MeetingMeta): string {
  const typeLabel =
    meta.meetingType === "external" ? "外部會議記錄" : "內部會議記錄";
  const date = dateForFilename(meta.date);
  const sub = meta.subtitle.trim() ? `（${meta.subtitle.trim()}）` : "";
  return `【${meta.projectName}】_${date}_${typeLabel}${sub}.docx`;
}

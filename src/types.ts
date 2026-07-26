// ---- 會議記錄內容模型（對應公版 7 個表格） ----

export type MeetingType = "internal" | "external";

/** 表單填寫的會議基本資料 */
export interface MeetingMeta {
  projectName: string; // 案名（放入檔名【】）
  subtitle: string; // 副標（檔名括號）
  meetingType: MeetingType;
  title: string; // 會議標題（可留空自動用【案名】）
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  location: string;
  pms: string[]; // 專案 PM
  interns: string[]; // 實習生 / 導演
  client: string; // 客戶（外部會議）
  recorder: string; // 記錄人（單一）
  notes: string; // 手打筆記（參考）
}

/** 公版表格內容（Claude 產出、可編輯） */
export interface MeetingContent {
  basic: {
    meeting_type: MeetingType;
    title: string;
    date: string; // 已格式化：2026 年 07 月 26 日
    time: string; // 22：00 ～ 22：30
    location: string;
    recorder: string;
  };
  attendees: [string, string][]; // [單位, 人員]
  client: {
    name: string;
    project: string;
    needs: string[];
    changes: string[];
    feedback: string;
  };
  topics: { title: string; items: string[] }[];
  summary: string[];
  todos: [string, string, string][]; // [事項, 負責人, 截止日]
  next: {
    date: string;
    time: string;
    location: string;
    prep: string[];
    note: string;
  };
}

export interface AppSettings {
  openaiKey: string;
  claudeKey: string;
  whisperModel: string;
  claudeModel: string;
  language: string; // whisper 語言提示
}

export type Phase =
  | "idle"
  | "decoding"
  | "transcribing"
  | "analyzing"
  | "done"
  | "error";

export interface AudioItem {
  id: string;
  file: File;
  transcript?: string;
}

import type { MeetingContent, MeetingMeta } from "../types";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { formatDateChinese, formatTimeRange } from "./format";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeExtract {
  client?: Partial<MeetingContent["client"]>;
  topics?: MeetingContent["topics"];
  summary?: string[];
  todos?: [string, string, string][];
  next?: Partial<MeetingContent["next"]>;
}

/** 從回傳文字擷取第一個 JSON 物件（容錯：可能被前綴 `{` 或包了雜訊） */
function extractJson(text: string): ClaudeExtract {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude 未回傳有效 JSON：" + trimmed.slice(0, 200));
  }
  const jsonStr = trimmed.slice(start, end + 1);
  return JSON.parse(jsonStr) as ClaudeExtract;
}

/** 把表單名單組成公版「出席人員」表 */
function buildAttendees(meta: MeetingMeta): [string, string][] {
  const rows: [string, string][] = [];
  if (meta.pms.length) rows.push(["專案 PM", meta.pms.join("、")]);
  if (meta.interns.length) rows.push(["導演 / 實習生", meta.interns.join("、")]);
  if (meta.meetingType === "external" && meta.client)
    rows.push(["客戶", meta.client]);
  if (!rows.length) rows.push(["出席人員", meta.recorder]);
  return rows;
}

/** 呼叫 Claude 產出結構化會議記錄內容 */
export async function analyzeMeeting(
  meta: MeetingMeta,
  transcript: string,
  opts: { apiKey: string; model: string }
): Promise<MeetingContent> {
  const userMsg = buildUserMessage(meta, transcript, meta.notes);

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      // 允許瀏覽器端直呼 Anthropic API
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userMsg },
        // prefill 一個 `{` 強制模型直接吐 JSON
        { role: "assistant", content: "{" },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Claude 整理失敗（HTTP ${res.status}）：${detail.slice(0, 300)}`
    );
  }

  const data = await res.json();
  const raw: string = data?.content?.[0]?.text ?? "";
  // 因為 prefill 了 "{"，回傳需補回開頭大括號
  const extract = extractJson("{" + raw);

  return {
    basic: {
      meeting_type: meta.meetingType,
      title: meta.title || `【${meta.projectName}】`,
      date: formatDateChinese(meta.date),
      time: formatTimeRange(meta.timeStart, meta.timeEnd),
      location: meta.location,
      recorder: meta.recorder,
    },
    attendees: buildAttendees(meta),
    client: {
      name: extract.client?.name || meta.client || "",
      project: extract.client?.project || meta.projectName,
      needs: extract.client?.needs || [],
      changes: extract.client?.changes || [],
      feedback: extract.client?.feedback || "",
    },
    topics: extract.topics || [],
    summary: extract.summary || [],
    todos: extract.todos || [],
    next: {
      date: extract.next?.date || "待確認",
      time: extract.next?.time || "待確認",
      location: extract.next?.location || "",
      prep: extract.next?.prep || [],
      note: extract.next?.note || "",
    },
  };
}

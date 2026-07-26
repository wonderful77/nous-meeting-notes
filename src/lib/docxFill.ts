import PizZip from "pizzip";
import type { MeetingContent } from "../types";

// 直接在瀏覽器操作公版 .docx 的 OOXML（word/document.xml），
// 完整移植 fill_meeting_record.py：沿用每個儲存格既有段落格式、
// 補齊 eastAsia 字型避免中文掉回 Times New Roman、統一字級、
// 自動增列與移除多餘「（待補充）」列。

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const DEFAULT_FONT = "PingFang TC Regular";
const BULLET = "•   ";

type El = Element;

function directChildren(parent: El, tag: string): El[] {
  const out: El[] = [];
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 1 && (node as El).tagName === tag) out.push(node as El);
  }
  return out;
}

function directChild(parent: El, tag: string): El | null {
  return directChildren(parent, tag)[0] ?? null;
}

function makeCreator(doc: XMLDocument) {
  return (tag: string): El => doc.createElementNS(W_NS, tag);
}

function forceSize(create: (t: string) => El, rpr: El, sizeHalf: string) {
  for (const tag of ["w:sz", "w:szCs"]) {
    let el = directChild(rpr, tag);
    if (!el) {
      el = create(tag);
      rpr.appendChild(el);
    }
    el.setAttribute("w:val", sizeHalf);
  }
}

function defaultRpr(create: (t: string) => El, sizeHalf: string): El {
  const rpr = create("w:rPr");
  const fonts = create("w:rFonts");
  for (const attr of ["w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"]) {
    fonts.setAttribute(attr, DEFAULT_FONT);
  }
  rpr.appendChild(fonts);
  forceSize(create, rpr, sizeHalf);
  return rpr;
}

/** 借用儲存格內第一個 run 的 rPr（讓標籤維持 semibold、內容維持 regular） */
function referenceRpr(create: (t: string) => El, cell: El, sizeHalf: string): El {
  for (const p of directChildren(cell, "w:p")) {
    for (const r of directChildren(p, "w:r")) {
      const rpr = directChild(r, "w:rPr");
      if (rpr) return rpr.cloneNode(true) as El;
    }
  }
  return defaultRpr(create, sizeHalf);
}

function createRun(
  create: (t: string) => El,
  text: string,
  refRpr: El,
  sizeHalf: string
): El {
  const run = create("w:r");
  const rpr = refRpr.cloneNode(true) as El;
  let fonts = directChild(rpr, "w:rFonts");
  if (!fonts) {
    fonts = create("w:rFonts");
    rpr.insertBefore(fonts, rpr.firstChild);
  }
  // 只設 Latin 字型的 run 會讓中文掉字，補上 eastAsia
  if (!fonts.getAttribute("w:eastAsia")) {
    fonts.setAttribute("w:eastAsia", DEFAULT_FONT);
  }
  forceSize(create, rpr, sizeHalf);
  run.appendChild(rpr);

  const t = create("w:t");
  t.setAttribute("xml:space", "preserve");
  t.textContent = text;
  run.appendChild(t);
  return run;
}

/** 把 lines 寫入 cell，一行一段，沿用既有段落格式 */
function setCell(
  create: (t: string) => El,
  cell: El,
  lines: string | string[],
  sizeHalf: string
) {
  let arr = (Array.isArray(lines) ? lines : [lines]).map((x) => String(x));
  if (arr.length === 0) arr = [""];

  const ref = referenceRpr(create, cell, sizeHalf);

  let paras = directChildren(cell, "w:p");
  while (paras.length < arr.length) {
    const last = paras[paras.length - 1];
    const clone = last.cloneNode(true) as El;
    for (const r of directChildren(clone, "w:r")) clone.removeChild(r);
    last.after(clone);
    paras = directChildren(cell, "w:p");
  }
  while (paras.length > arr.length) {
    const extra = paras[paras.length - 1];
    extra.parentNode?.removeChild(extra);
    paras = directChildren(cell, "w:p");
  }

  paras.forEach((p, i) => {
    for (const r of directChildren(p, "w:r")) p.removeChild(r);
    p.appendChild(createRun(create, arr[i], ref, sizeHalf));
  });
}

function rowsOf(table: El): El[] {
  return directChildren(table, "w:tr");
}

function cellsOf(row: El): El[] {
  return directChildren(row, "w:tc");
}

function cellAt(table: El, r: number, c: number): El {
  return cellsOf(rowsOf(table)[r])[c];
}

/** 複製最後一列作為新資料列（保留欄位結構與框線），並清空內容 */
function addRow(table: El): El {
  const rows = rowsOf(table);
  const last = rows[rows.length - 1];
  const clone = last.cloneNode(true) as El;
  for (const cell of cellsOf(clone)) {
    const paras = directChildren(cell, "w:p");
    // 只留第一段、清掉其餘段落與所有 run
    paras.forEach((p, idx) => {
      if (idx === 0) {
        for (const r of directChildren(p, "w:r")) p.removeChild(r);
      } else {
        p.parentNode?.removeChild(p);
      }
    });
  }
  last.after(clone);
  return clone;
}

/** 取第 index 個資料列（0-based，跳過表頭），不足時增列 */
function dataRow(table: El, index: number): El {
  const rows = rowsOf(table);
  if (index < rows.length - 1) return rows[index + 1];
  return addRow(table);
}

/** 移除多餘的樣板列（保留表頭 + used 筆資料） */
function trimRows(table: El, used: number) {
  let rows = rowsOf(table);
  while (rows.length > used + 1) {
    const row = rows[rows.length - 1];
    row.parentNode?.removeChild(row);
    rows = rowsOf(table);
  }
}

/** 統一所有表格字級（含樣板標籤） */
function normaliseFontSize(create: (t: string) => El, tables: El[], sizeHalf: string) {
  for (const table of tables) {
    for (const row of rowsOf(table)) {
      for (const cell of cellsOf(row)) {
        for (const p of directChildren(cell, "w:p")) {
          for (const r of directChildren(p, "w:r")) {
            let rpr = directChild(r, "w:rPr");
            if (!rpr) {
              rpr = create("w:rPr");
              r.insertBefore(rpr, r.firstChild);
            }
            forceSize(create, rpr, sizeHalf);
          }
        }
      }
    }
  }
}

/** 載入模板並依內容產生 docx Blob */
export async function generateDocx(
  templateUrl: string,
  content: MeetingContent,
  fontSizePt = 9
): Promise<Blob> {
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`載入公版模板失敗（HTTP ${res.status}）`);
  const buf = await res.arrayBuffer();

  const zip = new PizZip(buf);
  const xmlText = zip.file("word/document.xml")?.asText();
  if (!xmlText) throw new Error("模板缺少 word/document.xml");

  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const parseErr = doc.getElementsByTagName("parsererror")[0];
  if (parseErr) throw new Error("模板 XML 解析失敗");

  const create = makeCreator(doc);
  const body = doc.getElementsByTagName("w:body")[0];
  const tables = directChildren(body, "w:tbl");
  if (tables.length < 7) {
    throw new Error(`模板表格數為 ${tables.length}，預期 7 個，請確認模板檔。`);
  }

  const size = String(Math.round(fontSizePt * 2)); // half-points

  const [t0, t1, t2, t3, t4, t5, t6] = tables;

  // 表格 0：基本資訊
  const external = content.basic.meeting_type === "external";
  setCell(
    create,
    cellAt(t0, 0, 1),
    external
      ? "  ☐  內部會議        ☑  外部客戶會議"
      : "  ☑  內部會議        ☐  外部客戶會議",
    size
  );
  const basicMap: [string, [number, number]][] = [
    [content.basic.title, [1, 1]],
    [content.basic.date, [2, 1]],
    [content.basic.time, [2, 3]],
    [content.basic.location, [3, 1]],
    [content.basic.recorder, [3, 3]],
  ];
  for (const [val, [r, c]] of basicMap) {
    if (val) setCell(create, cellAt(t0, r, c), val, size);
  }

  // 表格 1：出席人員
  content.attendees.forEach((pair, i) => {
    const row = dataRow(t1, i);
    const cells = cellsOf(row);
    setCell(create, cells[0], pair[0], size);
    setCell(create, cells[1], pair[1], size);
  });
  if (content.attendees.length) trimRows(t1, content.attendees.length);

  // 表格 2：客戶要求
  const clientMap: [string | string[], number][] = [
    [content.client.name, 0],
    [content.client.project, 1],
    [content.client.needs, 2],
    [content.client.changes, 3],
    [content.client.feedback, 4],
  ];
  for (const [val, r] of clientMap) {
    const has = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (has) setCell(create, cellAt(t2, r, 1), val, size);
  }

  // 表格 3：主題討論
  content.topics.forEach((topic, i) => {
    const row = dataRow(t3, i);
    const cells = cellsOf(row);
    setCell(create, cells[0], String(i + 1), size);
    setCell(create, cells[1], topic.title, size);
    setCell(create, cells[2], topic.items ?? [], size);
  });
  if (content.topics.length) trimRows(t3, content.topics.length);

  // 表格 4：重點摘要
  if (content.summary.length) {
    setCell(
      create,
      cellAt(t4, 0, 0),
      content.summary.map((s) => BULLET + s),
      size
    );
  }

  // 表格 5：待辦事項
  content.todos.forEach((todo, i) => {
    const [task, owner, due] = [todo[0] ?? "", todo[1] ?? "", todo[2] ?? ""];
    const row = dataRow(t5, i);
    const cells = cellsOf(row);
    setCell(create, cells[0], String(i + 1), size);
    setCell(create, cells[1], task, size);
    setCell(create, cells[2], owner, size);
    setCell(create, cells[3], due, size);
  });
  if (content.todos.length) trimRows(t5, content.todos.length);

  // 表格 6：下次會議
  const nextMap: [string | string[], [number, number]][] = [
    [content.next.date, [0, 1]],
    [content.next.time, [0, 3]],
    [content.next.location, [1, 1]],
    [content.next.prep, [2, 1]],
    [content.next.note, [3, 1]],
  ];
  for (const [val, [r, c]] of nextMap) {
    const has = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (has) setCell(create, cellAt(t6, r, c), val, size);
  }

  normaliseFontSize(create, tables, size);

  const serialized = new XMLSerializer().serializeToString(doc);
  zip.file("word/document.xml", serialized);

  return zip.generate({
    type: "blob",
    compression: "DEFLATE",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

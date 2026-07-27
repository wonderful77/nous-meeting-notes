import type { MeetingContent } from "../types";

interface Props {
  content: MeetingContent;
  onChange: (next: MeetingContent) => void;
}

/** 陣列 <-> 多行文字 */
const toText = (arr: string[]) => arr.join("\n");
const toArr = (text: string) =>
  text.split("\n").map((s) => s.replace(/\s+$/, "")).filter((s) => s.length > 0);

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-ink-900/50 p-5">
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="flex items-center gap-2 font-serif text-[17px] text-silver-100">
          <span className="text-accent">▌</span>
          {title}
        </h3>
        {hint && <span className="text-xs text-silver-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="field-input resize-y leading-relaxed"
    />
  );
}

export function ResultEditor({ content, onChange }: Props) {
  const patch = (p: Partial<MeetingContent>) => onChange({ ...content, ...p });

  return (
    <div className="space-y-4">
      {/* 出席人員 */}
      <Section title="出席人員" hint="格式：單位 ｜ 人員（一行一組）">
        <div className="space-y-2">
          {content.attendees.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row[0]}
                onChange={(e) => {
                  const next = [...content.attendees];
                  next[i] = [e.target.value, row[1]];
                  patch({ attendees: next });
                }}
                className="field-input w-40 py-2 text-sm"
                placeholder="單位"
              />
              <input
                value={row[1]}
                onChange={(e) => {
                  const next = [...content.attendees];
                  next[i] = [row[0], e.target.value];
                  patch({ attendees: next });
                }}
                className="field-input flex-1 py-2 text-sm"
                placeholder="人員（頓號分隔）"
              />
              <button
                className="btn-ghost px-3 py-2 text-silver-500"
                onClick={() =>
                  patch({ attendees: content.attendees.filter((_, j) => j !== i) })
                }
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="btn-ghost py-2 text-sm"
            onClick={() =>
              patch({ attendees: [...content.attendees, ["", ""]] })
            }
          >
            + 新增列
          </button>
        </div>
      </Section>

      {/* 客戶要求 */}
      <Section
        title="客戶要求"
        hint={
          content.basic.meeting_type === "external"
            ? "外部會議重點：客戶原話比轉述有價值"
            : "內部會議：改放對客戶的承諾與待確認事項"
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">名稱</label>
              <input
                value={content.client.name}
                onChange={(e) =>
                  patch({ client: { ...content.client, name: e.target.value } })
                }
                className="field-input py-2 text-sm"
              />
            </div>
            <div>
              <label className="field-label">專案</label>
              <input
                value={content.client.project}
                onChange={(e) =>
                  patch({
                    client: { ...content.client, project: e.target.value },
                  })
                }
                className="field-input py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="field-label">需求 needs（一行一項）</label>
            <TextArea
              value={toText(content.client.needs)}
              onChange={(v) =>
                patch({ client: { ...content.client, needs: toArr(v) } })
              }
            />
          </div>
          <div>
            <label className="field-label">要求修正 changes（一行一項）</label>
            <TextArea
              value={toText(content.client.changes)}
              onChange={(v) =>
                patch({ client: { ...content.client, changes: toArr(v) } })
              }
            />
          </div>
          <div>
            <label className="field-label">客戶回饋 feedback</label>
            <TextArea
              value={content.client.feedback}
              rows={2}
              onChange={(v) =>
                patch({ client: { ...content.client, feedback: v } })
              }
            />
          </div>
        </div>
      </Section>

      {/* 主題討論 */}
      <Section title="會議主題討論" hint="每個主題底下條列，一行一條">
        <div className="space-y-3">
          {content.topics.map((topic, i) => (
            <div
              key={i}
              className="rounded-xl border border-black/[0.06] bg-ink-800/50 p-3"
            >
              <div className="mb-2 flex gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-silver-100 text-sm text-ink-950">
                  {i + 1}
                </span>
                <input
                  value={topic.title}
                  onChange={(e) => {
                    const next = [...content.topics];
                    next[i] = { ...topic, title: e.target.value };
                    patch({ topics: next });
                  }}
                  className="field-input flex-1 py-2 text-sm font-medium"
                  placeholder="主題標題"
                />
                <button
                  className="btn-ghost px-3 py-2 text-silver-500"
                  onClick={() =>
                    patch({ topics: content.topics.filter((_, j) => j !== i) })
                  }
                >
                  ✕
                </button>
              </div>
              <TextArea
                value={toText(topic.items)}
                rows={3}
                onChange={(v) => {
                  const next = [...content.topics];
                  next[i] = { ...topic, items: toArr(v) };
                  patch({ topics: next });
                }}
                placeholder="條列說明…"
              />
            </div>
          ))}
          <button
            className="btn-ghost py-2 text-sm"
            onClick={() =>
              patch({ topics: [...content.topics, { title: "", items: [] }] })
            }
          >
            + 新增主題
          </button>
        </div>
      </Section>

      {/* 重點摘要 */}
      <Section title="會議重點摘要" hint="站高一層的歸納，5 條以內">
        <TextArea
          value={toText(content.summary)}
          onChange={(v) => patch({ summary: toArr(v) })}
          rows={4}
        />
      </Section>

      {/* 待辦事項 */}
      <Section title="待辦事項與交付清單" hint="做什麼 ｜ 誰做 ｜ 何時交">
        <div className="space-y-2">
          {content.todos.map((todo, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-silver-100 text-sm text-ink-950">
                {i + 1}
              </span>
              <input
                value={todo[0]}
                onChange={(e) => {
                  const next = [...content.todos];
                  next[i] = [e.target.value, todo[1], todo[2]];
                  patch({ todos: next });
                }}
                className="field-input flex-1 py-2 text-sm"
                placeholder="事項"
              />
              <input
                value={todo[1]}
                onChange={(e) => {
                  const next = [...content.todos];
                  next[i] = [todo[0], e.target.value, todo[2]];
                  patch({ todos: next });
                }}
                className="field-input w-32 py-2 text-sm"
                placeholder="負責人"
              />
              <input
                value={todo[2]}
                onChange={(e) => {
                  const next = [...content.todos];
                  next[i] = [todo[0], todo[1], e.target.value];
                  patch({ todos: next });
                }}
                className="field-input w-28 py-2 text-sm"
                placeholder="截止日"
              />
              <button
                className="btn-ghost px-3 py-2 text-silver-500"
                onClick={() =>
                  patch({ todos: content.todos.filter((_, j) => j !== i) })
                }
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="btn-ghost py-2 text-sm"
            onClick={() => patch({ todos: [...content.todos, ["", "", ""]] })}
          >
            + 新增待辦
          </button>
        </div>
      </Section>

      {/* 下次會議 */}
      <Section title="下次會議安排">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="field-label">日期</label>
              <input
                value={content.next.date}
                onChange={(e) =>
                  patch({ next: { ...content.next, date: e.target.value } })
                }
                className="field-input py-2 text-sm"
              />
            </div>
            <div>
              <label className="field-label">時間</label>
              <input
                value={content.next.time}
                onChange={(e) =>
                  patch({ next: { ...content.next, time: e.target.value } })
                }
                className="field-input py-2 text-sm"
              />
            </div>
            <div>
              <label className="field-label">地點</label>
              <input
                value={content.next.location}
                onChange={(e) =>
                  patch({ next: { ...content.next, location: e.target.value } })
                }
                className="field-input py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="field-label">需完成項目（一行一項）</label>
            <TextArea
              value={toText(content.next.prep)}
              onChange={(v) =>
                patch({ next: { ...content.next, prep: toArr(v) } })
              }
              rows={3}
            />
          </div>
          <div>
            <label className="field-label">備註</label>
            <TextArea
              value={content.next.note}
              rows={2}
              onChange={(v) => patch({ next: { ...content.next, note: v } })}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

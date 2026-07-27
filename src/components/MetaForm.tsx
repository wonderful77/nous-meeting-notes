import type { MeetingMeta } from "../types";
import { MultiSelect } from "./MultiSelect";
import { PRESET_INTERNS, PRESET_PMS, PRESET_RECORDERS } from "../lib/presets";

interface Props {
  meta: MeetingMeta;
  onChange: (next: MeetingMeta) => void;
}

export function MetaForm({ meta, onChange }: Props) {
  const set = <K extends keyof MeetingMeta>(k: K, v: MeetingMeta[K]) =>
    onChange({ ...meta, [k]: v });

  return (
    <div className="space-y-6">
      {/* 案名 + 副標 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">案名（檔名【】內）</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">
              【
            </span>
            <input
              value={meta.projectName}
              onChange={(e) => set("projectName", e.target.value)}
              placeholder="Jeffery"
              className="field-input px-8"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-silver-500">
              】
            </span>
          </div>
        </div>
        <div>
          <label className="field-label">副標（檔名括號，可留空）</label>
          <input
            value={meta.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="腳本初提"
            className="field-input"
          />
        </div>
      </div>

      {/* 會議類別 */}
      <div>
        <label className="field-label">會議類別</label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["internal", "內部會議"],
              ["external", "外部客戶會議"],
            ] as const
          ).map(([val, label]) => {
            const on = meta.meetingType === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => set("meetingType", val)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  on
                    ? "border-transparent bg-silver-100 text-ink-950 shadow-[0_8px_20px_-10px_rgba(22,24,29,0.5)]"
                    : "border-black/[0.12] bg-black/[0.02] text-silver-400 hover:border-black/25"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 日期 / 時間 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">會議日期</label>
          <input
            type="date"
            value={meta.date}
            onChange={(e) => set("date", e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">會議時間</label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={meta.timeStart}
              onChange={(e) => set("timeStart", e.target.value)}
              className="field-input"
            />
            <span className="text-silver-500">～</span>
            <input
              type="time"
              value={meta.timeEnd}
              onChange={(e) => set("timeEnd", e.target.value)}
              className="field-input"
            />
          </div>
        </div>
      </div>

      {/* 地點 + 記錄人 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">會議地點</label>
          <input
            value={meta.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="線上會議 / 公司"
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">記錄人</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_RECORDERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => set("recorder", name)}
                className={`chip ${
                  meta.recorder === name ? "chip-on" : "chip-off"
                }`}
              >
                {name}
              </button>
            ))}
            <input
              value={
                PRESET_RECORDERS.includes(meta.recorder) ? "" : meta.recorder
              }
              onChange={(e) => set("recorder", e.target.value)}
              placeholder="其他…"
              className="field-input w-28 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* PM / 實習生 */}
      <MultiSelect
        label="專案 PM（可多選）"
        preset={PRESET_PMS}
        value={meta.pms}
        onChange={(v) => set("pms", v)}
        placeholder="新增其他 PM…"
      />
      <MultiSelect
        label="實習生 / 導演（可多選）"
        preset={PRESET_INTERNS}
        value={meta.interns}
        onChange={(v) => set("interns", v)}
        placeholder="新增其他實習生…"
      />

      {/* 客戶（外部才顯示） */}
      {meta.meetingType === "external" && (
        <div className="animate-fade-up">
          <label className="field-label">客戶 / 藝人</label>
          <input
            value={meta.client}
            onChange={(e) => set("client", e.target.value)}
            placeholder="Jeffery（藝人 / 樂團）"
            className="field-input"
          />
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

interface Props {
  label: string;
  preset: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/** 預設多選 chips + 自訂新增（自訂項目也會顯示為可切換 chip） */
export function MultiSelect({
  label,
  preset,
  value,
  onChange,
  placeholder = "新增其他人員…",
}: Props) {
  const [draft, setDraft] = useState("");

  const toggle = (name: string) => {
    onChange(
      value.includes(name) ? value.filter((v) => v !== name) : [...value, name]
    );
  };

  const addCustom = () => {
    const name = draft.trim();
    if (!name) return;
    if (!value.includes(name)) onChange([...value, name]);
    setDraft("");
  };

  // 顯示的 chip：預設 + 已選但不在預設中的自訂項目
  const customSelected = value.filter((v) => !preset.includes(v));
  const chips = [...preset, ...customSelected];

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {chips.map((name) => {
          const on = value.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`chip ${on ? "chip-on" : "chip-off"}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                  on ? "bg-ink-950" : "bg-silver-500/40"
                }`}
              />
              {name}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder}
          className="field-input py-2 text-sm"
        />
        <button type="button" onClick={addCustom} className="btn-ghost py-2">
          新增
        </button>
      </div>
    </div>
  );
}

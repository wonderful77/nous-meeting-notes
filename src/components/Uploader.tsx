import { useRef, useState } from "react";
import type { AudioItem } from "../types";
import { formatBytes } from "../lib/audio";

interface Props {
  items: AudioItem[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export function Uploader({ items, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(f.name));
    if (files.length) onAdd(files);
  };

  return (
    <div>
      <label className="field-label">會議語音檔（可多檔，mp3 / wav / m4a…）</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          dragging
            ? "border-silver-400/70 bg-black/[0.05]"
            : "border-black/[0.1] bg-black/[0.02] hover:border-black/25 hover:bg-black/[0.04]"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-ink-800 text-silver-300 transition-transform group-hover:scale-110">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3v13" strokeLinecap="round" />
            <path d="m7 8 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 21h14" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[15px] text-silver-200">拖曳語音檔到這裡，或點擊選取</p>
          <p className="mt-1 text-xs text-silver-500">
            超長會議會自動切段轉錄，無須手動裁切
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-ink-800/60 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-silver-400">♪</span>
                <span className="truncate text-sm text-silver-200">{item.file.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-silver-500">{formatBytes(item.file.size)}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-silver-500 transition-colors hover:text-red-600"
                  aria-label="移除"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

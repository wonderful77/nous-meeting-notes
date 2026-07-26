import { useState } from "react";
import type { AppSettings } from "../types";

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [showKeys, setShowKeys] = useState(false);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-lg animate-fade-up rounded-2xl p-7 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl text-silver-100">API 設定</h2>
          <button onClick={onClose} className="text-silver-500 hover:text-silver-200">
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="field-label">OpenAI API Key（Whisper 語音轉文字）</label>
            <input
              type={showKeys ? "text" : "password"}
              value={draft.openaiKey}
              onChange={(e) => set("openaiKey", e.target.value)}
              placeholder="sk-..."
              className="field-input font-mono text-sm"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="field-label">Claude API Key（會議記錄整理）</label>
            <input
              type={showKeys ? "text" : "password"}
              value={draft.claudeKey}
              onChange={(e) => set("claudeKey", e.target.value)}
              placeholder="sk-ant-..."
              className="field-input font-mono text-sm"
              autoComplete="off"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-silver-400">
            <input
              type="checkbox"
              checked={showKeys}
              onChange={(e) => setShowKeys(e.target.checked)}
              className="accent-silver-200"
            />
            顯示金鑰
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Whisper 模型</label>
              <input
                value={draft.whisperModel}
                onChange={(e) => set("whisperModel", e.target.value)}
                className="field-input text-sm"
              />
            </div>
            <div>
              <label className="field-label">語言</label>
              <input
                value={draft.language}
                onChange={(e) => set("language", e.target.value)}
                placeholder="zh"
                className="field-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Claude 模型</label>
            <input
              value={draft.claudeModel}
              onChange={(e) => set("claudeModel", e.target.value)}
              className="field-input text-sm"
            />
            <p className="mt-1.5 text-xs text-silver-500">
              若你的金鑰對應較新版本，可改為 claude-sonnet-4-5 等最新模型名稱。
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <p className="text-xs text-silver-500">
            金鑰僅存於此瀏覽器 localStorage，不會上傳伺服器。
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}

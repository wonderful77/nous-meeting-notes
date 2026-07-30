import { useState } from "react";
import type { AppSettings } from "../types";
import { listModels, type ClaudeModel } from "../lib/claude";

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  const [models, setModels] = useState<ClaudeModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const loadModels = async () => {
    setModelError("");
    setLoadingModels(true);
    try {
      const list = await listModels();
      setModels(list);
      // 若目前模型不在清單內，自動選第一個（最新）
      if (list.length && !list.some((m) => m.id === draft.claudeModel)) {
        set("claudeModel", list[0].id);
      }
    } catch (e) {
      setModelError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingModels(false);
    }
  };

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
          <h2 className="font-serif text-xl text-silver-100">模型設定</h2>
          <button onClick={onClose} className="text-silver-500 hover:text-silver-200">
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-4 text-xs leading-relaxed text-silver-400">
            金鑰由後端代理（Vercel 環境變數）持有，不再存於瀏覽器，也不會出現在網頁原始碼中。
          </div>

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
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="field-label mb-0">Claude 模型</label>
              <button
                type="button"
                onClick={loadModels}
                disabled={loadingModels}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                {loadingModels ? "載入中…" : "載入可用模型"}
              </button>
            </div>

            {models.length > 0 ? (
              <select
                value={draft.claudeModel}
                onChange={(e) => set("claudeModel", e.target.value)}
                className="field-input text-sm"
              >
                {/* 若當前值不在清單，仍保留可見 */}
                {!models.some((m) => m.id === draft.claudeModel) && (
                  <option value={draft.claudeModel}>
                    {draft.claudeModel}（目前設定）
                  </option>
                )}
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}（{m.id}）
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={draft.claudeModel}
                onChange={(e) => set("claudeModel", e.target.value)}
                className="field-input text-sm"
              />
            )}

            {modelError ? (
              <p className="mt-1.5 text-xs text-red-600">{modelError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-silver-500">
                模型名稱若過時會回報 404。點「載入可用模型」直接取得目前可用清單再選取。
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <p className="text-xs text-silver-500">
            模型偏好僅存於此瀏覽器 localStorage。
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

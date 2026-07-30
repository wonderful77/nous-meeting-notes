import { useEffect, useState } from "react";
import type {
  AppSettings,
  AudioItem,
  MeetingContent,
  MeetingMeta,
  Phase,
} from "./types";
import { Logo } from "./components/Logo";
import { Hero } from "./components/Hero";
import { Settings } from "./components/Settings";
import { MetaForm } from "./components/MetaForm";
import { Uploader } from "./components/Uploader";
import { ResultEditor } from "./components/ResultEditor";
import { loadSettings, saveSettings, loadDraft, saveDraft } from "./lib/storage";
import { todayISO } from "./lib/presets";
import { transcribeFile, type TranscribeProgress } from "./lib/whisper";
import { analyzeMeeting } from "./lib/claude";
import { generateDocx, downloadBlob } from "./lib/docxFill";
import { buildFilename } from "./lib/format";

const TEMPLATE_URL = `${import.meta.env.BASE_URL}template.docx`;
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_META: MeetingMeta = {
  projectName: "Jeffery",
  subtitle: "",
  meetingType: "internal",
  title: "",
  date: todayISO(),
  timeStart: "22:00",
  timeEnd: "22:30",
  location: "線上會議",
  pms: [],
  interns: ["萬德佛"],
  client: "",
  recorder: "萬德佛",
  notes: "",
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);

  const [meta, setMeta] = useState<MeetingMeta>(() => ({
    ...DEFAULT_META,
    ...(loadDraft<MeetingMeta>() ?? {}),
  }));
  const [audio, setAudio] = useState<AudioItem[]>([]);
  const [transcript, setTranscript] = useState("");
  const [content, setContent] = useState<MeetingContent | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // 表單自動存草稿
  useEffect(() => {
    saveDraft(meta);
  }, [meta]);

  const busy = phase === "decoding" || phase === "transcribing" || phase === "analyzing";

  const addAudio = (files: File[]) =>
    setAudio((prev) => [...prev, ...files.map((file) => ({ id: uid(), file }))]);
  const removeAudio = (id: string) =>
    setAudio((prev) => prev.filter((a) => a.id !== id));

  const persistSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  };

  const onProgress = (p: TranscribeProgress, fileIdx: number, fileTotal: number) => {
    if (p.stage === "decoding") {
      setStatus(`解析音檔（${fileIdx}/${fileTotal}）：${p.fileName}`);
    } else {
      setStatus(
        `轉錄中（檔案 ${fileIdx}/${fileTotal}，分段 ${p.chunkIndex}/${p.chunkTotal}）`
      );
    }
  };

  /** 完整流程：轉錄 → Claude 整理 */
  const runPipeline = async () => {
    setError("");
    if (audio.length === 0 && !meta.notes.trim() && !transcript.trim()) {
      setError("請至少上傳語音檔，或在筆記欄輸入內容。");
      return;
    }
    if (!meta.projectName.trim()) {
      setError("請填寫案名。");
      return;
    }

    try {
      let fullTranscript = transcript;

      if (audio.length > 0) {
        setPhase("transcribing");
        const parts: string[] = [];
        for (let i = 0; i < audio.length; i++) {
          const text = await transcribeFile(
            audio[i].file,
            {
              model: settings.whisperModel,
              language: settings.language,
            },
            (p) => onProgress(p, i + 1, audio.length)
          );
          parts.push(text);
        }
        fullTranscript = parts.join("\n\n");
        setTranscript(fullTranscript);
      }

      setPhase("analyzing");
      setStatus("Claude 正在依公版原則整理會議記錄…");
      const result = await analyzeMeeting(meta, fullTranscript, {
        model: settings.claudeModel,
      });
      setContent(result);
      setPhase("done");
      setStatus("整理完成，可微調後匯出。");
      setTimeout(
        () =>
          document
            .getElementById("result")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  /** 只重新跑 Claude（編輯逐字稿或筆記後） */
  const reanalyze = async () => {
    setError("");
    try {
      setPhase("analyzing");
      setStatus("重新整理中…");
      const result = await analyzeMeeting(meta, transcript, {
        model: settings.claudeModel,
      });
      setContent(result);
      setPhase("done");
      setStatus("已重新整理。");
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const exportDocx = async () => {
    if (!content) return;
    setError("");
    try {
      // 匯出時同步表單最新的 basic（類別/日期/時間/記錄人）
      const merged: MeetingContent = {
        ...content,
        basic: {
          ...content.basic,
          meeting_type: meta.meetingType,
          recorder: meta.recorder,
        },
      };
      const blob = await generateDocx(TEMPLATE_URL, merged);
      downloadBlob(blob, buildFilename(meta));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="min-h-full pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <div>
              <h1 className="font-serif text-lg leading-none text-silver-100">
                會議記錄
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-silver-500">
                NOUS · Meeting Minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-silver-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              後端代理
            </span>
            <button onClick={() => setShowSettings(true)} className="btn-ghost py-2">
              設定
            </button>
          </div>
        </div>
      </header>

      {/* 主視覺 */}
      <div className="mx-auto max-w-5xl px-5 pt-8">
        <Hero />
      </div>

      <main className="mx-auto max-w-4xl px-5 pt-8">
        <div className="space-y-6">
          {/* 1. 會議資料 */}
          <Card step="01" title="會議資料">
            <MetaForm meta={meta} onChange={setMeta} />
          </Card>

          {/* 2. 語音與筆記 */}
          <Card step="02" title="語音與參考筆記">
            <div className="space-y-6">
              <Uploader items={audio} onAdd={addAudio} onRemove={removeAudio} />
              <div>
                <label className="field-label">手打筆記（參考，與逐字稿衝突時以此為準）</label>
                <textarea
                  value={meta.notes}
                  onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
                  rows={5}
                  placeholder="貼上當天手記重點、結論、待辦…（可留空）"
                  className="field-input resize-y leading-relaxed"
                />
              </div>
            </div>
          </Card>

          {/* 3. 逐字稿（轉錄後出現） */}
          {(transcript || audio.length > 0) && phase !== "idle" && (
            <Card step="03" title="逐字稿" hint="可直接修正同音錯字後重新整理">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                placeholder="轉錄後的逐字稿會顯示在這裡…"
                className="field-input resize-y font-mono text-[13px] leading-relaxed"
              />
            </Card>
          )}

          {/* 4. 結果編輯 */}
          {content && (
            <div id="result" className="animate-fade-up">
              <Card step="04" title="會議記錄內容" hint="Claude 產出，可自由微調">
                <ResultEditor content={content} onChange={setContent} />
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[20px] text-sm">
            {error ? (
              <span className="text-red-600">{error}</span>
            ) : busy ? (
              <span className="flex items-center gap-2 text-silver-300">
                <Spinner />
                {status}
              </span>
            ) : status ? (
              <span className="text-silver-400">{status}</span>
            ) : (
              <span className="text-silver-500">
                {audio.length > 0
                  ? `已載入 ${audio.length} 個語音檔`
                  : "上傳語音或輸入筆記後開始"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {content && (
              <button onClick={reanalyze} disabled={busy} className="btn-ghost">
                重新整理
              </button>
            )}
            {!content ? (
              <button onClick={runPipeline} disabled={busy} className="btn-primary">
                {busy ? "處理中…" : "產生會議記錄"}
              </button>
            ) : (
              <button onClick={exportDocx} className="btn-primary">
                匯出 .docx
              </button>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <Settings
          settings={settings}
          onSave={persistSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function Card({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass animate-fade-up relative rounded-[22px] p-6 shadow-glow sm:p-8">
      <span className="plus-mark absolute right-5 top-5">＋</span>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="spec text-accent/80">{step}</span>
        <h3 className="font-serif text-xl text-silver-100">{title}</h3>
        {hint && <span className="text-xs text-silver-500">{hint}</span>}
      </div>
      <div className="hairline mb-6" />
      {children}
    </section>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-silver-500/40 border-t-silver-100" />
  );
}

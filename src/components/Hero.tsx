import { useRef } from "react";
import { Logo } from "./Logo";

/**
 * 主視覺：黑白簽名漸層編輯風。
 * — 各向異性光十字（signature flare）＋顆粒質感
 * — 滑鼠視差僅位移 transform（避免版面重排）
 * — 角落十字標記與底部規格條，呼應 grid-system 編輯排版
 */
export function Hero() {
  const flareRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = flareRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translate3d(${px * 26}px, ${py * 20}px, 0) scale(1.08)`;
  };

  const onLeave = () => {
    if (flareRef.current)
      flareRef.current.style.transform = "translate3d(0,0,0) scale(1)";
  };

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="grain animate-fade-up relative isolate overflow-hidden rounded-[26px] border border-white/[0.07] shadow-glow"
    >
      {/* 簽名漸層層（視差） */}
      <div
        ref={flareRef}
        className="signature absolute inset-0 -z-10 transition-transform duration-500 ease-out will-change-transform"
      />

      {/* 角落十字標記 */}
      <span className="plus-mark absolute left-5 top-5">＋</span>
      <span className="plus-mark absolute right-5 top-5">＋</span>
      <span className="plus-mark absolute bottom-5 left-5">＋</span>
      <span className="plus-mark absolute bottom-5 right-5">＋</span>

      <div className="relative flex min-h-[340px] flex-col justify-between gap-10 px-7 py-9 sm:min-h-[400px] sm:px-12 sm:py-11">
        {/* 上：品牌識別 */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo size={54} />
            <div className="leading-none">
              <p className="spec mb-2">NOUS · Meeting Minutes System</p>
              <h1 className="font-serif text-4xl tracking-tight text-silver-100 sm:text-6xl">
                會議記錄
              </h1>
            </div>
          </div>
          <div className="hidden flex-col items-end gap-1 pt-1 sm:flex">
            <span className="spec">Rev</span>
            <span className="spec-value">v1.0 — 2026</span>
          </div>
        </div>

        {/* 中：標語 */}
        <div className="max-w-2xl">
          <p className="text-[15px] leading-relaxed text-silver-300 sm:text-lg">
            導入會議語音，
            <span className="text-silver-100">Whisper</span> 轉錄逐字稿、
            <span className="text-silver-100">Claude</span> 依 NOUS 整理原則去蕪存菁，
            一鍵匯出公版 <span className="text-silver-100">.docx</span> 會議記錄。
          </p>
        </div>

        {/* 下：規格條 */}
        <div>
          <div className="hairline mb-4" />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <SpecItem label="Input" value="Voice / Notes" />
            <SpecItem label="Engine" value="Whisper × Claude" />
            <SpecItem label="Template" value="公版 7 Tables" />
            <SpecItem label="Output" value=".docx" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="spec">{label}</dt>
      <dd className="spec-value text-silver-100">{value}</dd>
    </div>
  );
}

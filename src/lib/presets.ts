// 預設名單（可在介面新增自訂人員）
export const PRESET_PMS = ["Lily", "Barry", "盛霓"];
export const PRESET_INTERNS = ["萬德佛", "宏奕", "躍達"];
export const PRESET_RECORDERS = ["萬德佛", "宏奕", "躍達"];

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

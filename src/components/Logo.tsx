export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="./logo.png"
      alt="INTENTION"
      width={size}
      height={size}
      className="select-none drop-shadow-[0_3px_12px_rgba(22,24,29,0.22)]"
      draggable={false}
    />
  );
}

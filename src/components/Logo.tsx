export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="./logo.png"
      alt="INTENTION"
      width={size}
      height={size}
      className="select-none drop-shadow-[0_2px_10px_rgba(201,204,212,0.25)]"
      draggable={false}
    />
  );
}

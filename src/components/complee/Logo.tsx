export interface LogoProps {
  /** Pixel size of the square. */
  size?: number;
  /** Single character / short string used as the wordmark. Defaults to "C". */
  letter?: string;
  /** Optional aria-label; pass when the logo is the only label for a control. */
  label?: string;
}

export function Logo({ size = 24, letter = "C", label }: LogoProps) {
  return (
    <div
      className="flex items-center justify-center rounded-md bg-navy text-navy-foreground font-bold"
      style={{ width: size, height: size, fontSize: size * 0.6, lineHeight: 1 }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {letter}
    </div>
  );
}

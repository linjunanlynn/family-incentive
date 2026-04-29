import * as React from "react";

/**
 * BrokenStar — outline 5-point star with a jagged "crack" running through it.
 * Visual language for kid-facing "lost a star" (negative behavior).
 *
 * Sized & stroked to mimic lucide-react icons so it can sit next to <Star /> at
 * the same size without alignment drift.
 */
export function BrokenStar({
  size = 24,
  className,
  strokeWidth = 1.8,
  ...rest
}: React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* Star outline (lucide Star path) */}
      <path d="M11.5 2.5 14 8.2 20.2 9l-4.6 4.4 1.1 6.3-5.2-2.7-5.2 2.7 1.1-6.3L1.8 9 8 8.2z" />
      {/* Jagged "crack" — runs from upper-right point through the center toward
          the lower-left, with a small offset to read as fractured glass. */}
      <path
        d="M14.6 5.2 11.4 10.4 13.4 12.2 9.4 18.6"
        strokeWidth={strokeWidth + 0.3}
      />
    </svg>
  );
}

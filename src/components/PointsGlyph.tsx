import * as React from "react";
import { Star } from "lucide-react";
import { BrokenStar } from "@/components/icons/BrokenStar";
import { cn } from "@/lib/utils";

/**
 * Single visual primitive for "earn / lose a star".
 *  - positive: filled gold star (gain)
 *  - negative: BrokenStar in slate (loss / dimmed)
 *
 * Use this anywhere the legacy `☆` / `△` characters were used so the styling
 * stays consistent across check-in tiles, summary cards, recent log chips,
 * dashboard KPI subtitles, etc.
 */
export function PointsGlyph({
  type,
  size = 16,
  className,
  /** When true, applies a brief shake animation. */
  animate = false,
}: {
  type: "positive" | "negative";
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  if (type === "positive") {
    return (
      <Star
        width={size}
        height={size}
        strokeWidth={1.6}
        className={cn(
          "fill-amber-400 text-amber-500 shrink-0",
          animate && "animate-pop",
          className,
        )}
        aria-hidden
      />
    );
  }
  return (
    <BrokenStar
      size={size}
      className={cn(
        "text-[color:var(--negative-soft)] shrink-0",
        animate && "animate-crack",
        className,
      )}
    />
  );
}

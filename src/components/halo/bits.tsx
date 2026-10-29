import { Lock, Shield } from "lucide-react";
import type { Thread } from "@/lib/halo/types";

export function Monogram({ letters, hot }: { letters: string; hot?: boolean }) {
  return (
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-sm tracking-wide ${
        hot ? "bg-signal text-oled" : "bg-line text-ink"
      }`}
      aria-hidden
    >
      {letters}
    </span>
  );
}

export function ChannelPill({ thread }: { thread: Thread }) {
  if (thread.rcs) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-display text-xs tracking-widest text-signal uppercase">
        {thread.e2ee ? <Lock className="size-3" aria-hidden /> : <Shield className="size-3" aria-hidden />}
        RCS
      </span>
    );
  }
  return <span className="shrink-0 font-display text-xs tracking-widest text-dim uppercase">SMS</span>;
}

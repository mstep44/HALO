import { useEffect, useRef } from "react";
import { previewOf, unreadCount } from "@/lib/halo/data";
import { totalUnread, useHalo } from "@/lib/halo/store";
import { ChannelPill, Monogram } from "./bits";
import { useHardware } from "./hardware";

export function Inbox() {
  const threads = useHalo((s) => s.threads);
  const focus = useHalo((s) => s.focus);
  const move = useHalo((s) => s.moveFocus);
  const openFocused = useHalo((s) => s.openFocused);
  const openThread = useHalo((s) => s.openThread);
  const back = useHalo((s) => s.back);
  const setGlance = useHalo((s) => s.setGlance);
  const glance = useHalo((s) => s.glance);
  const banner = useHalo((s) => s.banner);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useHardware({
    up: () => {
      if (!glance) move(-1);
    },
    down: () => {
      if (!glance) move(1);
    },
    start: () => {
      if (glance) return;
      if (banner) openThread(banner.threadId);
      else openFocused();
    },
    back,
    light: () => setGlance(!glance),
  });

  useEffect(() => {
    items.current[focus]?.scrollIntoView({ block: "nearest" });
  }, [focus]);

  const unread = totalUnread(threads);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl tracking-wide text-balance">Messages</h2>
        <p className="text-xs text-dim tabular-nums">{unread ? `${unread} new` : "Clear"}</p>
      </div>
      <div className="watch-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" role="listbox" aria-label="Conversations">
        {threads.map((thread, index) => {
          const count = unreadCount(thread);
          const selected = index === focus;
          const last = thread.messages[thread.messages.length - 1];
          return (
            <button
              key={thread.id}
              type="button"
              role="option"
              aria-selected={selected}
              ref={(el) => {
                items.current[index] = el;
              }}
              onClick={() => openThread(thread.id)}
              className={`flex min-h-11 items-center gap-2 rounded-2xl px-2 py-1 text-left ${selected ? "row-on" : ""}`}
            >
              <Monogram letters={thread.monogram} hot={count > 0} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate font-medium ${count ? "text-ink" : "text-dim"}`}>{thread.name}</span>
                  <span className="shrink-0 text-xs text-dim tabular-nums">{last?.clock}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className={`truncate text-xs ${thread.typing ? "text-signal" : "text-dim"}`}>{previewOf(thread)}</span>
                  <ChannelPill thread={thread} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

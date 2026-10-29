import { useEffect, useRef, useState } from "react";
import { useHalo } from "@/lib/halo/store";
import { MessageBody } from "./message";

export function Phone() {
  const threads = useHalo((s) => s.threads);
  const screen = useHalo((s) => s.screen);
  const focus = useHalo((s) => s.focus);
  const openThread = useHalo((s) => s.openThread);
  const activeId = screen.name === "thread" || screen.name === "photo" ? screen.threadId : threads[focus]?.id;
  const thread = threads.find((t) => t.id === activeId) ?? threads[0];
  const scroller = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages.length, thread?.id, thread?.typing]);

  if (!thread) return null;

  return (
    <section className="phone-shell" aria-label="Paired handset">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm tracking-widest text-dim">HANDSET</p>
        <p className="text-xs text-signal">Pocket mode</p>
      </div>
      <h2 className="mt-1 font-display text-3xl tracking-wide text-balance">{thread.name}</h2>
      <p className="text-xs text-pretty text-dim">
        {thread.phone}
        {" · "}
        {thread.rcs ? "RCS chat synced with the watch" : "SMS chat · photos fall back to MMS"}
      </p>
      <div className="watch-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
        {threads.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === thread.id}
            className={`min-h-11 shrink-0 rounded-full px-3 text-sm ${
              item.id === thread.id ? "bg-signal text-oled" : "bg-line text-ink"
            }`}
            onClick={() => openThread(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div ref={scroller} className="watch-scroll mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-2">
        {thread.messages.map((message) => (
          <MessageBody
            key={message.id}
            thread={thread}
            message={message}
            playing={playing === message.id}
            onToggleAudio={(id) => {
              if (playing === id) {
                setPlaying(null);
                return;
              }
              setPlaying(id);
              const seconds = message.media?.kind === "audio" ? message.media.seconds : 2;
              window.setTimeout(() => setPlaying((cur) => (cur === id ? null : cur)), seconds * 1000);
            }}
          />
        ))}
        {thread.typing ? <p className="text-sm text-signal">Typing…</p> : null}
      </div>
      <p className="border-t border-line pt-3 text-sm text-pretty text-dim">
        The phone stays pocketed. Compose on the watch —{" "}
        {thread.rcs
          ? "RCS carries read receipts, typing, and reactions."
          : "plain text goes as SMS, and voice or photos go as MMS."}
      </p>
    </section>
  );
}

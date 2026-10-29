import { Camera, ChevronLeft, Mic, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CAMERA_ROLL, PHRASES } from "@/lib/halo/data";
import { useHalo } from "@/lib/halo/store";
import type { Thread } from "@/lib/halo/types";
import { useHardware } from "./hardware";
import { MessageBody } from "./message";
import { REACTIONS } from "./reactions";

export function ThreadView({ threadId }: { threadId: string }) {
  const thread = useHalo((s) => s.threads.find((t) => t.id === threadId));
  const back = useHalo((s) => s.back);
  const sendText = useHalo((s) => s.sendText);
  const sendMedia = useHalo((s) => s.sendMedia);
  const react = useHalo((s) => s.react);
  const openPhoto = useHalo((s) => s.openPhoto);
  const glance = useHalo((s) => s.glance);
  const setGlance = useHalo((s) => s.setGlance);

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "voice" | "roll" | "phrases">("text");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "voice") return;
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.max(1, Math.round((Date.now() - start) / 1000)));
    }, 200);
    return () => window.clearInterval(id);
  }, [mode]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread?.messages.length, thread?.typing, mode]);

  const sendDraft = (text: string) => {
    if (!thread) return;
    sendText(thread.id, text, replyTo ?? undefined);
    setDraft("");
    setReplyTo(null);
    setSelected(null);
    setMode("text");
  };

  useHardware({
    up: () => {
      if (glance || mode !== "text") return;
      scroller.current?.scrollBy({ top: -88, behavior: "smooth" });
    },
    down: () => {
      if (glance || mode !== "text") return;
      scroller.current?.scrollBy({ top: 88, behavior: "smooth" });
    },
    start: () => {
      if (glance || !thread) return;
      if (mode === "voice") {
        sendMedia(thread.id, { kind: "audio", seconds: Math.max(1, elapsed) });
        setMode("text");
        setElapsed(0);
        return;
      }
      if (draft.trim()) sendDraft(draft);
      else inputRef.current?.focus();
    },
    back: () => {
      if (mode !== "text") {
        setMode("text");
        setElapsed(0);
        return;
      }
      if (selected) {
        setSelected(null);
        return;
      }
      if (replyTo) {
        setReplyTo(null);
        return;
      }
      back();
    },
    light: () => setGlance(!glance),
  });

  if (!thread) {
    return (
      <div className="flex flex-1 flex-col items-start justify-center gap-3">
        <p className="text-sm text-dim">That conversation is gone.</p>
        <button type="button" className="min-h-11 rounded-full bg-line px-4 text-sm" onClick={() => back()}>
          Back to messages
        </button>
      </div>
    );
  }

  const quoted = replyTo ? thread.messages.find((m) => m.id === replyTo) : undefined;
  const suggestions = thread.suggestions ?? [];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="mb-1 flex items-center gap-1">
        <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full" onClick={() => back()} aria-label="Back to messages">
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate font-medium">{thread.name}</h2>
          <p className="truncate text-xs text-dim">
            {thread.rcs ? (thread.e2ee ? "RCS · encrypted" : "RCS · Universal Profile") : "SMS · no read receipt"}
            {thread.members ? ` · ${thread.members}` : ""}
          </p>
        </div>
      </div>

      {mode === "voice" ? (
        <Recorder thread={thread} elapsed={elapsed} onCancel={() => { setMode("text"); setElapsed(0); }} onSend={() => {
          sendMedia(thread.id, { kind: "audio", seconds: Math.max(1, elapsed) });
          setMode("text");
          setElapsed(0);
        }} />
      ) : null}

      {mode === "roll" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display tracking-widest text-signal">{thread.rcs ? "RCS FILE" : "MMS"}</p>
            <button type="button" className="grid size-11 place-items-center" aria-label="Close camera roll" onClick={() => setMode("text")}>
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CAMERA_ROLL.map((photo) => (
              <button
                key={photo.src}
                type="button"
                className="overflow-hidden rounded-xl"
                onClick={() => {
                  sendMedia(thread.id, { kind: "image", src: photo.src, alt: photo.alt });
                  setMode("text");
                }}
              >
                <img src={photo.src} alt={photo.alt} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-pretty text-dim">
            {thread.rcs ? "High-resolution file transfer over RCS." : "This contact is SMS-only, so the photo sends as MMS."}
          </p>
        </div>
      ) : null}

      {mode === "phrases" ? (
        <div className="watch-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display tracking-widest text-dim">QUICK REPLY</p>
            <button type="button" className="grid size-11 place-items-center" aria-label="Close phrases" onClick={() => setMode("text")}>
              <X className="size-4" />
            </button>
          </div>
          {PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              className="min-h-11 rounded-2xl bg-line px-3 text-left text-sm"
              onClick={() => sendDraft(phrase)}
            >
              {phrase}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "text" ? (
        <>
          <div ref={scroller} className="watch-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-1">
            {thread.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl ${selected === message.id ? "is-picked" : ""}`}
                onClick={() => setSelected((cur) => (cur === message.id ? null : message.id))}
              >
                <MessageBody
                  thread={thread}
                  message={message}
                  compact
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
                  onOpenImage={(id) => openPhoto(thread.id, id)}
                  onChip={(chip) => sendDraft(chip)}
                />
              </div>
            ))}
            {thread.typing ? <p className="px-2 text-xs text-signal">Typing…</p> : null}
          </div>

          {selected ? (
            <div className="watch-scroll mb-1 flex gap-1 overflow-x-auto">
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-full bg-line px-3 text-sm"
                onClick={() => {
                  setReplyTo(selected);
                  setSelected(null);
                  inputRef.current?.focus();
                }}
              >
                Reply
              </button>
              {thread.rcs ? (
                REACTIONS.map((reaction) => {
                  const Icon = reaction.Icon;
                  const on = thread.messages.find((m) => m.id === selected)?.reactions.includes(reaction.id);
                  return (
                    <button
                      key={reaction.id}
                      type="button"
                      aria-label={reaction.label}
                      aria-pressed={on}
                      className={`grid size-11 shrink-0 place-items-center rounded-full ${on ? "bg-signal text-oled" : "bg-line text-ink"}`}
                      onClick={() => react(thread.id, selected, reaction.id)}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })
              ) : (
                <span className="self-center px-2 text-xs text-dim">Reactions need RCS</span>
              )}
            </div>
          ) : null}

            <div className="watch-scroll mb-1 flex gap-1 overflow-x-auto">
              {(suggestions.length > 0 ? suggestions : PHRASES).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="min-h-11 shrink-0 rounded-full bg-line px-3 text-sm"
                  onClick={() => sendDraft(chip)}
                >
                  {chip}
                </button>
              ))}
              {suggestions.length > 0 ? (
                <button
                  type="button"
                  className="min-h-11 shrink-0 rounded-full bg-line px-3 text-sm text-dim"
                  onClick={() => setMode("phrases")}
                >
                  More
                </button>
              ) : null}
            </div>

          {quoted ? (
            <div className="mb-1 flex items-center gap-2 text-xs text-dim">
              <span className="min-w-0 flex-1 truncate">Reply · {quoted.text ?? "Attachment"}</span>
              <button type="button" className="grid size-11 place-items-center" aria-label="Cancel reply" onClick={() => setReplyTo(null)}>
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) sendDraft(draft);
            }}
          >
            <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full bg-line" aria-label="Record voice message" onClick={() => { setElapsed(0); setMode("voice"); }}>
              <Mic className="size-4" />
            </button>
            <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full bg-line" aria-label="Send a photo" onClick={() => setMode("roll")}>
              <Camera className="size-4" />
            </button>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={thread.rcs ? "RCS" : "SMS"}
              aria-label={thread.rcs ? "RCS reply" : "SMS reply"}
              className="h-11 min-w-0 flex-1 rounded-full bg-line px-3 text-base text-ink outline-none placeholder:text-dim"
            />
            <button
              type="submit"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-oled disabled:opacity-40"
              disabled={!draft.trim()}
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}

function Recorder({
  thread,
  elapsed,
  onCancel,
  onSend,
}: {
  thread: Thread;
  elapsed: number;
  onCancel: () => void;
  onSend: () => void;
}) {
  const label = `0:${String(elapsed).padStart(2, "0")}`;
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
      <span className="wave text-signal" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <p className="font-display text-5xl text-ink tabular-nums">{label}</p>
      <p className="text-center text-xs text-pretty text-dim">
        {thread.rcs ? "Voice note sends over RCS." : "Voice note sends as MMS."}
      </p>
      <div className="flex gap-2">
        <button type="button" className="min-h-11 rounded-full bg-line px-4 text-sm" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="min-h-11 rounded-full bg-signal px-4 text-sm font-medium text-oled" onClick={onSend}>
          Send
        </button>
      </div>
    </div>
  );
}

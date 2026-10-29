import {
  Check,
  CheckCheck,
  FileText,
  MapPin,
  Pause,
  Play,
  Watch,
} from "lucide-react";
import type { ChatMessage, ReactionId, Thread } from "@/lib/halo/types";
import { ReactionGlyph } from "./reactions";

const REACTION_LABEL: Record<ReactionId, string> = {
  like: "Like",
  love: "Love",
  laugh: "Laugh",
  wow: "Wow",
  sad: "Sad",
  down: "Dislike",
};

export function deliveryLabel(message: ChatMessage): string {
  if (!message.mine) return message.clock;
  if (message.delivery === "sending") return "Sending";
  if (message.transport === "sms") return "Sent · SMS";
  if (message.transport === "mms") {
    if (message.delivery === "delivered") return "Delivered · MMS";
    if (message.delivery === "read") return "Read · MMS";
    return "Sent · MMS";
  }
  if (message.delivery === "read") return "Read";
  if (message.delivery === "delivered") return "Delivered";
  return "Sent · RCS";
}

function quoteText(thread: Thread, id: string | undefined): string | null {
  if (!id) return null;
  const target = thread.messages.find((m) => m.id === id);
  if (!target) return null;
  if (target.text) return target.text;
  if (target.card) return target.card.title;
  if (target.media?.kind === "image") return "Photo";
  if (target.media?.kind === "audio") return "Voice message";
  if (target.media?.kind === "location") return target.media.title;
  if (target.media?.kind === "file") return target.media.name;
  return "Message";
}

export function MessageBody({
  thread,
  message,
  playing,
  onToggleAudio,
  onOpenImage,
  onChip,
  compact,
}: {
  thread: Thread;
  message: ChatMessage;
  playing: boolean;
  onToggleAudio: (id: string) => void;
  onOpenImage?: (id: string) => void;
  onChip?: (chip: string) => void;
  compact?: boolean;
}) {
  const quote = quoteText(thread, message.replyTo);
  const mine = message.mine;
  const read = message.transport === "rcs" && message.delivery === "read";

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      {!mine && message.author ? (
        <p className="px-1 font-display text-xs tracking-wide text-signal uppercase">{message.author}</p>
      ) : null}
        <div className={`min-w-0 rounded-2xl px-3 py-2 text-ink ${mine ? "bubble-mine" : "bubble-theirs"}`}>
        {quote ? (
          <p className="mb-1 truncate border-l-2 border-signal pl-2 text-xs text-dim">{quote}</p>
        ) : null}
        {message.card ? (
          <div className="mb-1">
            <p className="font-medium text-pretty">{message.card.title}</p>
            <p className="text-sm text-pretty text-dim">{message.card.detail}</p>
            {message.card.chips.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.card.chips.map((chip) =>
                  onChip ? (
                    <button
                      key={chip}
                      type="button"
                      className="min-h-11 rounded-full bg-line px-3 text-sm text-ink"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChip(chip);
                      }}
                    >
                      {chip}
                    </button>
                  ) : (
                    <span key={chip} className="rounded-full bg-line px-2 py-1 text-xs text-ink">
                      {chip}
                    </span>
                  ),
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        {message.media?.kind === "image" ? (
          <button
            type="button"
            className="mb-1 block overflow-hidden rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onOpenImage?.(message.id);
            }}
            aria-label={`View photo: ${message.media.alt}`}
          >
            <img
              src={message.media.src}
              alt={message.media.alt}
              className={`w-full object-cover ${compact ? "h-28" : "h-40"}`}
            />
          </button>
        ) : null}
        {message.media?.kind === "audio" ? (
          <button
            type="button"
            className="mb-1 flex min-h-11 items-center gap-2 text-ink"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAudio(message.id);
            }}
            aria-label={playing ? "Pause voice message" : "Play voice message"}
          >
            {playing ? <Pause className="size-4 shrink-0" /> : <Play className="size-4 shrink-0" />}
            <span className={`wave text-signal ${playing ? "" : "is-idle"}`} aria-hidden>
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${(i % 5) * 0.08}s` }} />
              ))}
            </span>
            <span className="text-xs tabular-nums text-dim">0:{String(message.media.seconds).padStart(2, "0")}</span>
          </button>
        ) : null}
        {message.media?.kind === "location" ? (
          <div className="mb-1 flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden />
            <span>
              <span className="block font-medium">{message.media.title}</span>
              <span className="block text-xs text-dim">{message.media.detail}</span>
            </span>
          </div>
        ) : null}
        {message.media?.kind === "file" ? (
          <div className="mb-1 flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-signal" aria-hidden />
            <span>
              <span className="block font-medium">{message.media.name}</span>
              <span className="block text-xs text-dim">{message.media.size}</span>
            </span>
          </div>
        ) : null}
        {message.text ? <p className="text-sm text-pretty">{message.text}</p> : null}
      </div>
      {message.reactions.length > 0 ? (
        <div className="flex gap-1 px-1">
          {message.reactions.map((id) => (
            <span
              key={id}
              title={REACTION_LABEL[id]}
              className="grid size-6 place-items-center rounded-full bg-line text-ink"
            >
              <ReactionGlyph id={id} className="size-3.5" />
            </span>
          ))}
        </div>
      ) : null}
      <p className={`flex items-center gap-1 px-1 text-xs tabular-nums ${read ? "text-signal" : "text-dim"}`}>
        {message.fromWrist ? <Watch className="size-3" aria-label="Sent from the watch" /> : null}
        <span>{deliveryLabel(message)}</span>
        {message.mine && message.transport === "rcs" && message.delivery === "read" ? (
          <CheckCheck className="size-3.5" aria-hidden />
        ) : null}
        {message.mine && message.transport === "rcs" && (message.delivery === "delivered" || message.delivery === "sent") ? (
          message.delivery === "delivered" ? <CheckCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />
        ) : null}
        {!message.mine ? null : message.transport === "sms" || message.transport === "mms" ? (
          message.delivery !== "sending" ? <Check className="size-3.5" aria-hidden /> : null
        ) : null}
      </p>
    </div>
  );
}

import { Bluetooth, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useHalo } from "@/lib/halo/store";
import { themeById } from "@/lib/halo/themes";
import { useHardware, useHardwareFire } from "./hardware";
import { Colors } from "./colors";
import { Inbox } from "./inbox";
import { ThreadView } from "./thread";

function Clock() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      h = h % 12 || 12;
      setTime(`${h}:${m}`);
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="font-display text-lg text-ink tabular-nums">{time}</span>;
}

function Glance() {
  return (
    <div className="glance-sheet absolute inset-0 z-20 flex flex-col gap-3 overflow-y-auto rounded-3xl pt-2">
      <p className="font-display text-2xl tracking-wide">Phone link</p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-display tracking-widest text-dim">BLUETOOTH</dt>
          <dd>Connected to the handset</dd>
        </div>
        <div>
          <dt className="font-display tracking-widest text-signal">RCS</dt>
          <dd>Registered · Universal Profile 2.7</dd>
        </div>
        <div>
          <dt className="font-display tracking-widest text-dim">SECURITY</dt>
          <dd className="text-pretty">End-to-end encryption when the contact supports it</dd>
        </div>
        <div>
          <dt className="font-display tracking-widest text-alert">FALLBACK</dt>
          <dd className="text-pretty">SMS for text. MMS for photos and voice.</dd>
        </div>
      </dl>
      <p className="text-sm text-pretty text-dim">
        Direct reply stays on the wrist. Receipts, typing, and reactions only travel when the thread is RCS.
      </p>
    </div>
  );
}

function Banner() {
  const banner = useHalo((s) => s.banner);
  const openThread = useHalo((s) => s.openThread);
  const dismiss = useHalo((s) => s.dismissBanner);
  if (!banner) return null;
  return (
    <div className="absolute inset-x-0 top-8 z-10 flex items-stretch gap-1 rounded-2xl bg-line p-1">
      <button type="button" className="min-h-11 min-w-0 flex-1 px-2 text-left" onClick={() => openThread(banner.threadId)}>
        <span className="block font-display tracking-widest text-signal">RCS · {banner.title}</span>
        <span className="block truncate text-sm">{banner.text}</span>
      </button>
      <button type="button" className="grid size-11 shrink-0 place-items-center" aria-label="Dismiss notification" onClick={dismiss}>
        <X className="size-4" />
      </button>
    </div>
  );
}

function PhotoView({ threadId, messageId }: { threadId: string; messageId: string }) {
  const thread = useHalo((s) => s.threads.find((t) => t.id === threadId));
  const back = useHalo((s) => s.back);
  const glance = useHalo((s) => s.glance);
  const setGlance = useHalo((s) => s.setGlance);
  const message = thread?.messages.find((m) => m.id === messageId);

  useHardware({
    up: () => {},
    down: () => {},
    start: () => back(),
    back,
    light: () => setGlance(!glance),
  });

  if (!message || message.media?.kind !== "image") {
    return (
      <button type="button" className="min-h-11 text-sm text-dim" onClick={() => back()}>
        Close
      </button>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button type="button" className="mb-2 min-h-11 self-start text-sm text-dim" onClick={() => back()}>
        Close
      </button>
      <img src={message.media.src} alt={message.media.alt} className="min-h-0 w-full flex-1 rounded-2xl object-cover" />
      {message.text ? <p className="mt-2 text-sm text-pretty">{message.text}</p> : null}
    </div>
  );
}

export function Watch() {
  const screen = useHalo((s) => s.screen);
  const pulse = useHalo((s) => s.pulse);
  const glance = useHalo((s) => s.glance);
  const setGlance = useHalo((s) => s.setGlance);
  const banner = useHalo((s) => s.banner);
  const theme = useHalo((s) => s.theme);
  const openColors = useHalo((s) => s.openColors);
  const fire = useHardwareFire();

  return (
    <div className="watch-rig">
      <div className="watch-bezel">
        <div className={`watch-face ${pulse ? "is-pulse" : ""}`}>
          <div className="watch-safe">
            <div className="mb-1 flex items-center justify-between">
              <Clock />
              <span className="flex items-center gap-2 text-xs text-signal">
                <button
                  type="button"
                  className="grid size-11 place-items-center"
                  aria-label={`Watch color, ${themeById(theme).name}. Change color.`}
                  onClick={() => openColors()}
                >
                  <span className="color-dot" />
                </button>
                <Bluetooth className="size-3.5" aria-label="Phone connected" />
                <span className="font-display tracking-widest">RCS</span>
              </span>
            </div>
            {screen.name === "inbox" ? <Inbox /> : null}
            {screen.name === "colors" ? <Colors /> : null}
            {screen.name === "thread" || screen.name === "photo" ? (
              <div className={screen.name === "photo" ? "hidden" : "flex min-h-0 flex-1 flex-col"}>
                <ThreadView threadId={screen.threadId} />
              </div>
            ) : null}
            {screen.name === "photo" ? <PhotoView threadId={screen.threadId} messageId={screen.messageId} /> : null}
            {glance ? <Glance /> : null}
            <Banner />
            <p className="sr-only" aria-live="polite">
              {banner ? `${banner.title}. ${banner.text}` : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="watch-dock">
        <button type="button" className="hw hw-light" aria-label="Light, phone link" onClick={() => setGlance(!glance)}>
          <span aria-hidden>LIGHT</span>
        </button>
        <button type="button" className="hw hw-up" aria-label="Up" onClick={() => fire.current.up()}>
          <span aria-hidden>UP</span>
        </button>
        <button type="button" className="hw hw-down" aria-label="Down" onClick={() => fire.current.down()}>
          <span aria-hidden>DOWN</span>
        </button>
        <button type="button" className="hw hw-back" aria-label="Back" onClick={() => fire.current.back()}>
          <span aria-hidden>BACK</span>
        </button>
        <button type="button" className="hw hw-start" aria-label="Start" onClick={() => fire.current.start()}>
          <span aria-hidden>START</span>
        </button>
      </div>
    </div>
  );
}

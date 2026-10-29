import { useEffect } from "react";
import { armDemo, totalUnread, useHalo } from "@/lib/halo/store";
import { themeById } from "@/lib/halo/themes";
import { HardwareProvider } from "./hardware";
import { Phone } from "./phone";
import { Watch } from "./watch";

function ThemePaint() {
  const theme = useHalo((s) => s.theme);
  useEffect(() => {
    const spec = themeById(theme);
    const root = document.documentElement;
    root.style.setProperty("--color-signal", spec.signal);
    root.style.setProperty("--color-alert", spec.alert);
    root.style.setProperty("--color-face", spec.face);
    root.style.setProperty("--color-bezel", spec.bezel);
    root.style.setProperty("--color-line", spec.line);
  }, [theme]);
  return null;
}

export function HaloApp() {
  const device = useHalo((s) => s.device);
  const setDevice = useHalo((s) => s.setDevice);
  const reset = useHalo((s) => s.reset);
  const threads = useHalo((s) => s.threads);
  const unread = totalUnread(threads);

  useEffect(() => {
    let cancel = false;
    void Promise.resolve(useHalo.persist.rehydrate())
      .catch(() => undefined)
      .then(() => {
        if (cancel) return;
        const state = useHalo.getState();
        const valid =
          Array.isArray(state.threads) &&
          state.threads.length > 0 &&
          state.threads.every((t) => Array.isArray(t.messages) && typeof t.rcs === "boolean");
        if (!valid) state.reset();
        else {
          if (state.theme !== themeById(state.theme).id) state.setTheme("signal");
          armDemo();
        }
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <HardwareProvider>
      <ThemePaint />
      <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden px-4 py-6 sm:px-8">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-display text-sm tracking-widest text-signal">WRIST MESSENGER</p>
            <h1 className="font-display text-5xl leading-none tracking-wide text-balance">HALO</h1>
            <p className="mt-2 text-sm text-pretty text-dim">
              Answer SMS, MMS, and RCS without taking the phone out. These are sample threads from a paired
              handset — anything you send leaves the watch immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-line p-1 lg:hidden" role="tablist" aria-label="Which device to show">
              <button
                type="button"
                role="tab"
                aria-selected={device === "wrist"}
                className={`min-h-11 rounded-full px-4 text-sm ${device === "wrist" ? "bg-face text-ink" : "text-dim"}`}
                onClick={() => setDevice("wrist")}
              >
                Wrist
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={device === "handset"}
                className={`min-h-11 rounded-full px-4 text-sm ${device === "handset" ? "bg-face text-ink" : "text-dim"}`}
                onClick={() => setDevice("handset")}
              >
                Handset
              </button>
            </div>
            <button type="button" className="min-h-11 rounded-full px-3 text-sm text-dim" onClick={() => reset()}>
              Reset
            </button>
          </div>
        </header>
        <p className="sr-only" aria-live="polite">
          {unread ? `${unread} unread` : "Inbox clear"}
        </p>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,36rem)_24rem] lg:justify-center lg:gap-8">
          <div className={device === "handset" ? "hidden lg:block" : ""}>
            <Watch />
          </div>
          <div className={device === "wrist" ? "hidden lg:block" : ""}>
            <Phone />
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-pretty text-dim">
          UP and DOWN scroll. START opens or sends. BACK returns. LIGHT shows the phone link. The color dot on the
          watch changes the face. On a wide screen the handset stays beside the watch.
        </p>
      </main>
    </HardwareProvider>
  );
}

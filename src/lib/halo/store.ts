import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clockNow, createSeed, nextId } from "./data";
import type { ChatMessage, Delivery, Media, ReactionId, Screen, Thread, Transport } from "./types";

type Banner = { threadId: string; title: string; text: string } | null;

type HaloState = {
  threads: Thread[];
  screen: Screen;
  focus: number;
  banner: Banner;
  pulse: boolean;
  glance: boolean;
  device: "wrist" | "handset";
  openThread: (id: string) => void;
  back: () => void;
  moveFocus: (dir: -1 | 1) => void;
  openFocused: () => void;
  openPhoto: (threadId: string, messageId: string) => void;
  sendText: (threadId: string, text: string, replyTo?: string) => void;
  sendMedia: (threadId: string, media: Media) => void;
  react: (threadId: string, messageId: string, reaction: ReactionId) => void;
  dismissBanner: () => void;
  setGlance: (open: boolean) => void;
  setDevice: (device: "wrist" | "handset") => void;
  reset: () => void;
};

let epoch = 0;
let demoArmed = false;
const timers = new Set<ReturnType<typeof setTimeout>>();

function later(ms: number, fn: () => void, stamp: number) {
  const id = setTimeout(() => {
    timers.delete(id);
    if (stamp !== epoch) return;
    fn();
  }, ms);
  timers.add(id);
}

function clearTimers() {
  for (const id of timers) clearTimeout(id);
  timers.clear();
}

function patchThread(threads: Thread[], id: string, fn: (t: Thread) => Thread): Thread[] {
  return threads.map((t) => (t.id === id ? fn(t) : t));
}

function patchMessage(
  threads: Thread[],
  threadId: string,
  messageId: string,
  fn: (m: ChatMessage) => ChatMessage,
): Thread[] {
  return patchThread(threads, threadId, (t) => ({
    ...t,
    messages: t.messages.map((m) => (m.id === messageId ? fn(m) : m)),
  }));
}

function transportFor(thread: Thread, media: boolean): Transport {
  if (!thread.rcs) return media ? "mms" : "sms";
  return "rcs";
}

export const useHalo = create<HaloState>()(
  persist(
    (set, get) => ({
      threads: createSeed(),
      screen: { name: "inbox" },
      focus: 0,
      banner: null,
      pulse: false,
      glance: false,
      device: "wrist",

      openThread: (id) => {
        const now = Date.now();
        set((s) => ({
          glance: false,
          pulse: false,
          banner: s.banner?.threadId === id ? null : s.banner,
          screen: { name: "thread", threadId: id },
          focus: Math.max(
            0,
            s.threads.findIndex((t) => t.id === id),
          ),
          threads: patchThread(s.threads, id, (t) => ({
            ...t,
            readAt: Math.max(t.readAt, now, ...t.messages.map((m) => m.at)),
          })),
        }));
      },

      back: () => {
        const screen = get().screen;
        if (get().glance) {
          set({ glance: false });
          return;
        }
        if (screen.name === "photo") {
          set({ screen: { name: "thread", threadId: screen.threadId } });
          return;
        }
        if (screen.name === "thread") set({ screen: { name: "inbox" } });
      },

      moveFocus: (dir) => {
        const { threads, focus, screen } = get();
        if (screen.name !== "inbox") return;
        const next = Math.min(threads.length - 1, Math.max(0, focus + dir));
        set({ focus: next });
      },

      openFocused: () => {
        const { threads, focus, screen } = get();
        if (screen.name !== "inbox") return;
        const thread = threads[focus];
        if (thread) get().openThread(thread.id);
      },

      openPhoto: (threadId, messageId) =>
        set({ screen: { name: "photo", threadId, messageId }, glance: false }),

      sendText: (threadId, text, replyTo) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread) return;
        const id = nextId("out");
        const stamp = epoch;
        const message: ChatMessage = {
          id,
          mine: true,
          text: trimmed,
          at: Date.now(),
          clock: clockNow(),
          transport: transportFor(thread, false),
          delivery: "sending",
          reactions: [],
          replyTo,
          fromWrist: true,
        };
        set((s) => ({
          threads: patchThread(s.threads, threadId, (t) => ({
            ...t,
            suggestions: (t.suggestions ?? []).filter((c) => c !== trimmed),
            typing: false,
            readAt: message.at,
            messages: [...t.messages, message],
          })),
        }));
        scheduleDelivery(set, threadId, id, thread.rcs, stamp);
      },

      sendMedia: (threadId, media) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread) return;
        const id = nextId("out");
        const stamp = epoch;
        const message: ChatMessage = {
          id,
          mine: true,
          media,
          at: Date.now(),
          clock: clockNow(),
          transport: transportFor(thread, true),
          delivery: "sending",
          reactions: [],
          fromWrist: true,
        };
        set((s) => ({
          threads: patchThread(s.threads, threadId, (t) => ({
            ...t,
            readAt: message.at,
            messages: [...t.messages, message],
          })),
        }));
        scheduleDelivery(set, threadId, id, thread.rcs, stamp);
      },

      react: (threadId, messageId, reaction) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread?.rcs) return;
        set((s) => ({
          threads: patchMessage(s.threads, threadId, messageId, (m) => {
            const has = m.reactions.includes(reaction);
            return {
              ...m,
              reactions: has ? m.reactions.filter((r) => r !== reaction) : [...m.reactions, reaction],
            };
          }),
        }));
      },

      dismissBanner: () => set({ banner: null, pulse: false }),
      setGlance: (open) => set({ glance: open }),
      setDevice: (device) => set({ device }),

      reset: () => {
        epoch += 1;
        clearTimers();
        demoArmed = false;
        set({
          threads: createSeed(),
          screen: { name: "inbox" },
          focus: 0,
          banner: null,
          pulse: false,
          glance: false,
        });
        armDemo();
      },
    }),
    {
      name: "halo-rcs-v1",
      skipHydration: true,
      partialize: (s) => ({
        threads: s.threads,
        screen: s.screen,
        focus: s.focus,
        device: s.device,
      }),
    },
  ),
);

function scheduleDelivery(
  set: (fn: (s: HaloState) => Partial<HaloState>) => void,
  threadId: string,
  messageId: string,
  rcs: boolean,
  stamp: number,
) {
  const steps: [number, Delivery][] = rcs
    ? [
        [320, "sent"],
        [900, "delivered"],
        [2400, "read"],
      ]
    : [[480, "sent"]];
  for (const [ms, delivery] of steps) {
    later(
      ms,
      () => {
        set((s) => ({
          threads: patchMessage(s.threads, threadId, messageId, (m) => ({ ...m, delivery })),
        }));
      },
      stamp,
    );
  }
}

function pushInbound(
  set: (fn: (s: HaloState) => Partial<HaloState>) => void,
  get: () => HaloState,
  threadId: string,
  message: ChatMessage,
) {
  const screen = get().screen;
  const viewing = screen.name !== "inbox" && "threadId" in screen && screen.threadId === threadId;
  set((s) => ({
    pulse: true,
    banner: viewing
      ? s.banner
      : {
          threadId,
          title: s.threads.find((t) => t.id === threadId)?.name ?? "Message",
          text: message.text ?? "New message",
        },
    threads: patchThread(s.threads, threadId, (t) => ({
      ...t,
      typing: false,
      suggestions: threadId === "maya" ? ["I'll make it", "Order for me", "Running late"] : t.suggestions,
      readAt: viewing ? message.at : t.readAt,
      messages: [...t.messages, message],
    })),
  }));
  later(
    4600,
    () => {
      if (get().banner?.threadId === threadId) set(() => ({ banner: null, pulse: false }));
    },
    epoch,
  );
}

export function armDemo() {
  if (demoArmed || typeof window === "undefined") return;
  demoArmed = true;
  const stamp = epoch;
  const set = useHalo.setState;
  const get = useHalo.getState;
  const maya = get().threads.find((t) => t.id === "maya");
  if (maya?.messages.some((m) => m.id === "maya-live")) {
    if (maya.typing) {
      set((s) => ({ threads: patchThread(s.threads, "maya", (t) => ({ ...t, typing: false })) }));
    }
    return;
  }

  later(
    6500,
    () => {
      if (get().threads.find((t) => t.id === "maya")?.messages.some((m) => m.id === "maya-live")) return;
      set((s) => ({
        threads: patchThread(s.threads, "maya", (t) => ({ ...t, typing: true })),
      }));
    },
    stamp,
  );

  later(
    9800,
    () => {
      if (get().threads.find((t) => t.id === "maya")?.messages.some((m) => m.id === "maya-live")) {
        set((s) => ({ threads: patchThread(s.threads, "maya", (t) => ({ ...t, typing: false })) }));
        return;
      }
      const message: ChatMessage = {
        id: "maya-live",
        mine: false,
        text: "Kitchen closes at 9. If the train slips, text me and I'll order.",
        at: Date.now(),
        clock: clockNow(),
        transport: "rcs",
        reactions: [],
      };
      pushInbound(set, get, "maya", message);
    },
    stamp,
  );
}

export function totalUnread(threads: Thread[]): number {
  return threads.reduce((n, t) => n + t.messages.filter((m) => !m.mine && m.at > t.readAt).length, 0);
}

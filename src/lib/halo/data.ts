import type { ChatMessage, Thread } from "./types";

const T0 = 1_761_580_000_000;

export const PHRASES = [
  "On my way",
  "Can't talk — text me",
  "Call you later",
  "Sounds good",
  "Running a few late",
  "Yes",
];

export const CAMERA_ROLL = [
  { src: "/media/espresso.jpg", alt: "Espresso on a handlebar bag in morning light" },
  { src: "/media/ramen.jpg", alt: "Bowl of ramen on a dark wood table" },
  { src: "/media/trail.jpg", alt: "Mountain singletrack in late light" },
  { src: "/media/dog.jpg", alt: "Golden retriever on a sunlit porch" },
];

function msg(partial: Omit<ChatMessage, "reactions"> & { reactions?: ChatMessage["reactions"] }): ChatMessage {
  return { reactions: [], ...partial };
}

export function createSeed(): Thread[] {
  return [
    {
      id: "maya",
      name: "Maya Chen",
      monogram: "MC",
      phone: "+1 415 555 0142",
      rcs: true,
      e2ee: true,
      group: false,
      suggestions: ["On my way", "10 minutes", "Order for me"],
      typing: false,
      readAt: T0 + 40_000,
      messages: [
        msg({
          id: "m1",
          mine: false,
          text: "You still good for 7?",
          at: T0,
          clock: "6:28 PM",
          transport: "rcs",
        }),
        msg({
          id: "m2",
          mine: true,
          text: "Leaving the office now.",
          at: T0 + 40_000,
          clock: "6:31 PM",
          transport: "rcs",
          delivery: "read",
        }),
        msg({
          id: "m3",
          mine: false,
          text: "They held the corner table. This is the one you wanted.",
          media: { kind: "image", src: "/media/ramen.jpg", alt: "Bowl of spicy ramen" },
          at: T0 + 90_000,
          clock: "6:38 PM",
          transport: "rcs",
        }),
        msg({
          id: "m4",
          mine: false,
          text: "If you're late I'll order the spicy bowl.",
          at: T0 + 120_000,
          clock: "6:41 PM",
          transport: "rcs",
        }),
      ],
    },
    {
      id: "dad",
      name: "Dad",
      monogram: "DA",
      phone: "+1 503 555 0194",
      rcs: false,
      e2ee: false,
      group: false,
      suggestions: [],
      typing: false,
      readAt: T0 + 200_000,
      messages: [
        msg({
          id: "d1",
          mine: false,
          text: "Call when you land.",
          at: T0 + 10_000,
          clock: "4:12 PM",
          transport: "sms",
        }),
        msg({
          id: "d2",
          mine: true,
          text: "Will do.",
          at: T0 + 80_000,
          clock: "4:18 PM",
          transport: "sms",
          delivery: "sent",
        }),
        msg({
          id: "d3",
          mine: false,
          text: "Your mother says bring a jacket. It dropped to 40.",
          at: T0 + 200_000,
          clock: "5:02 PM",
          transport: "sms",
        }),
      ],
    },
    {
      id: "trail",
      name: "Trail crew",
      monogram: "TC",
      phone: "Group · 4",
      rcs: true,
      e2ee: true,
      group: true,
      members: "Jordan, Sam, Priya, you",
      suggestions: ["On my way", "Running late", "Start without me"],
      typing: false,
      readAt: T0 + 250_000,
      messages: [
        msg({
          id: "t1",
          mine: false,
          author: "Jordan",
          text: "Lot fills by 8. Park on the south edge.",
          media: {
            kind: "location",
            title: "Ridge trailhead",
            detail: "South lot · shared over RCS",
          },
          at: T0 + 230_000,
          clock: "5:46 PM",
          transport: "rcs",
        }),
        msg({
          id: "t2",
          mine: false,
          author: "Sam",
          text: "Dust is up but the singletrack is perfect.",
          media: { kind: "image", src: "/media/trail.jpg", alt: "Dirt trail through pines" },
          at: T0 + 260_000,
          clock: "5:51 PM",
          transport: "rcs",
        }),
        msg({
          id: "t3",
          mine: true,
          text: "Rolling in at 7:40.",
          at: T0 + 300_000,
          clock: "5:55 PM",
          transport: "rcs",
          delivery: "delivered",
        }),
      ],
    },
    {
      id: "alex",
      name: "Alex Rivera",
      monogram: "AR",
      phone: "+1 206 555 0177",
      rcs: true,
      e2ee: true,
      group: false,
      suggestions: ["Saturday works", "Tell him hi", "Send another"],
      typing: false,
      readAt: T0 + 310_000,
      messages: [
        msg({
          id: "a1",
          mine: false,
          media: { kind: "audio", seconds: 11 },
          at: T0 + 320_000,
          clock: "3:14 PM",
          transport: "rcs",
        }),
        msg({
          id: "a2",
          mine: false,
          text: "He sat by the door for an hour.",
          media: { kind: "image", src: "/media/dog.jpg", alt: "Golden retriever on a porch" },
          at: T0 + 340_000,
          clock: "3:16 PM",
          transport: "rcs",
        }),
      ],
    },
    {
      id: "priya",
      name: "Priya Shah",
      monogram: "PS",
      phone: "+1 628 555 0118",
      rcs: true,
      e2ee: false,
      group: false,
      suggestions: ["I'll be there", "Running late", "Dial in"],
      typing: false,
      readAt: T0 + 350_000,
      messages: [
        msg({
          id: "p1",
          mine: false,
          card: {
            title: "Standup moved to 9:15",
            detail: "Dial-in stays the same. 12 minutes.",
            chips: ["I'll be there", "Running late", "Dial in"],
          },
          at: T0 + 360_000,
          clock: "8:02 AM",
          transport: "rcs",
        }),
        msg({
          id: "p2",
          mine: false,
          text: "Can you walk them through the wrist RCS flow?",
          at: T0 + 400_000,
          clock: "8:06 AM",
          transport: "rcs",
        }),
      ],
    },
  ];
}

export function previewOf(thread: Thread): string {
  const last = thread.messages[thread.messages.length - 1];
  if (!last) return "No messages";
  if (thread.typing) return "Typing…";
  if (last.card) return last.card.title;
  if (last.media?.kind === "image") return last.text ? last.text : "Photo";
  if (last.media?.kind === "audio") return "Voice message";
  if (last.media?.kind === "location") return last.media.title;
  if (last.media?.kind === "file") return last.media.name;
  return last.text ?? "Message";
}

export function unreadCount(thread: Thread): number {
  return thread.messages.filter((m) => !m.mine && m.at > thread.readAt).length;
}

export function clockNow(d = new Date()): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

let seq = 0;
export function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}-${Math.random().toString(36).slice(2, 7)}`;
}

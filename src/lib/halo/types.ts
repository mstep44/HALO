export type Transport = "rcs" | "sms" | "mms";

export type Delivery = "sending" | "sent" | "delivered" | "read";

export type ReactionId = "like" | "love" | "laugh" | "wow" | "sad" | "down";

export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "audio"; seconds: number }
  | { kind: "location"; title: string; detail: string }
  | { kind: "file"; name: string; size: string };

export type RichCard = {
  title: string;
  detail: string;
  chips: string[];
};

export type ChatMessage = {
  id: string;
  mine: boolean;
  author?: string;
  text?: string;
  media?: Media;
  card?: RichCard;
  at: number;
  clock: string;
  transport: Transport;
  delivery?: Delivery;
  reactions: ReactionId[];
  replyTo?: string;
  fromWrist?: boolean;
};

export type Thread = {
  id: string;
  name: string;
  monogram: string;
  phone: string;
  rcs: boolean;
  e2ee: boolean;
  group: boolean;
  members?: string;
  suggestions: string[];
  typing: boolean;
  readAt: number;
  messages: ChatMessage[];
};

export type Screen =
  | { name: "inbox" }
  | { name: "thread"; threadId: string }
  | { name: "photo"; threadId: string; messageId: string };

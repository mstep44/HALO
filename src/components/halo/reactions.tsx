import { Frown, Heart, Laugh, Sparkles, ThumbsDown, ThumbsUp, type LucideIcon } from "lucide-react";
import type { ReactionId } from "@/lib/halo/types";

export const REACTIONS: { id: ReactionId; label: string; Icon: LucideIcon }[] = [
  { id: "like", label: "Like", Icon: ThumbsUp },
  { id: "love", label: "Love", Icon: Heart },
  { id: "laugh", label: "Laugh", Icon: Laugh },
  { id: "wow", label: "Wow", Icon: Sparkles },
  { id: "sad", label: "Sad", Icon: Frown },
  { id: "down", label: "Dislike", Icon: ThumbsDown },
];

export function ReactionGlyph({ id, className }: { id: ReactionId; className?: string }) {
  const found = REACTIONS.find((r) => r.id === id);
  if (!found) return null;
  const Icon = found.Icon;
  return <Icon className={className} aria-hidden />;
}

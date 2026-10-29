import { createFileRoute } from "@tanstack/react-router";
import { HaloApp } from "@/components/halo/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HaloApp />;
}

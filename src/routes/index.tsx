import { createFileRoute } from "@tanstack/react-router";
import GameView from "@/game/GameView";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Caveworld — Steinzeit-Wildnis" },
    { name: "description", content: "Erkunde eine Steinzeit-Wildnis als Höhlenmensch in einem mobilen Pixel-Art-Spiel." },
    { property: "og:title", content: "Caveworld — Steinzeit-Wildnis" },
    { property: "og:description", content: "Deine Reise durch eine offene Pixel-Art-Wildnis mit Touch-Steuerung." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GameView,
});

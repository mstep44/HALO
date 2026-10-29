export const THEMES = [
  {
    id: "signal",
    name: "Signal",
    detail: "Green on black",
    signal: "#3ee0a0",
    alert: "#ff8a3d",
    face: "#0c1116",
    bezel: "#12171c",
    line: "#2a3640",
  },
  {
    id: "ember",
    name: "Ember",
    detail: "Warm orange",
    signal: "#ff7a3c",
    alert: "#ffd166",
    face: "#140e0c",
    bezel: "#1c1410",
    line: "#3a2a22",
  },
  {
    id: "tide",
    name: "Tide",
    detail: "Cold blue",
    signal: "#3ec6ff",
    alert: "#ff8a3d",
    face: "#0b1218",
    bezel: "#101820",
    line: "#243848",
  },
  {
    id: "iris",
    name: "Iris",
    detail: "Violet",
    signal: "#c084fc",
    alert: "#ff8a3d",
    face: "#100c16",
    bezel: "#16101c",
    line: "#322844",
  },
  {
    id: "gold",
    name: "Gold",
    detail: "Brass on black",
    signal: "#e2c15a",
    alert: "#ff8a3d",
    face: "#12100c",
    bezel: "#1a1610",
    line: "#3a3424",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function themeById(id: string | undefined) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

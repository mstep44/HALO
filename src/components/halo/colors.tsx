import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/halo/themes";
import { useHalo } from "@/lib/halo/store";
import { useHardware } from "./hardware";

export function Colors() {
  const theme = useHalo((s) => s.theme);
  const setTheme = useHalo((s) => s.setTheme);
  const back = useHalo((s) => s.back);
  const glance = useHalo((s) => s.glance);
  const setGlance = useHalo((s) => s.setGlance);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [focus, setFocus] = useState(() => Math.max(0, THEMES.findIndex((item) => item.id === theme)));

  const pick = (index: number) => {
    const next = Math.min(THEMES.length - 1, Math.max(0, index));
    setFocus(next);
    setTheme(THEMES[next].id);
  };

  useHardware({
    up: () => {
      if (!glance) pick(focus - 1);
    },
    down: () => {
      if (!glance) pick(focus + 1);
    },
    start: () => {
      if (!glance) back();
    },
    back,
    light: () => setGlance(!glance),
  });

  useEffect(() => {
    items.current[focus]?.scrollIntoView({ block: "nearest" });
  }, [focus]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="font-display text-2xl tracking-wide">Color</h2>
      <p className="mb-2 text-xs text-dim">START keeps this look.</p>
      <div className="watch-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" role="listbox" aria-label="Watch colors">
        {THEMES.map((item, index) => {
          const selected = index === focus;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              ref={(node) => {
                items.current[index] = node;
              }}
              onClick={() => pick(index)}
              className={`flex min-h-11 items-center gap-2 rounded-2xl px-2 py-1 text-left ${selected ? "row-on" : ""}`}
            >
              <span className="color-dot" style={{ background: item.signal }} />
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="block truncate text-xs text-dim">{item.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

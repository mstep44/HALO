import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";

export type HardwareHandlers = {
  up: () => void;
  down: () => void;
  start: () => void;
  back: () => void;
  light: () => void;
};

type Ctx = {
  fire: React.MutableRefObject<HardwareHandlers>;
  setHandlers: (h: HardwareHandlers) => void;
};

const HardwareContext = createContext<Ctx | null>(null);

const noop = () => {};

export function HardwareProvider({ children }: { children: ReactNode }) {
  const fire = useRef<HardwareHandlers>({
    up: noop,
    down: noop,
    start: noop,
    back: noop,
    light: noop,
  });

  const setHandlers = useMemo(() => {
    return (h: HardwareHandlers) => {
      fire.current = h;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Escape") {
        fire.current.back();
        e.preventDefault();
        return;
      }
      if (typing) return;
      if (e.key === "ArrowUp") {
        fire.current.up();
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        fire.current.down();
        e.preventDefault();
      } else if (e.key === "Enter") {
        fire.current.start();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ fire, setHandlers }), [setHandlers]);
  return <HardwareContext.Provider value={value}>{children}</HardwareContext.Provider>;
}

export function useHardware(handlers: HardwareHandlers) {
  const ctx = useContext(HardwareContext);
  const latest = useRef(handlers);
  latest.current = handlers;

  useLayoutEffect(() => {
    ctx?.setHandlers({
      up: () => latest.current.up(),
      down: () => latest.current.down(),
      start: () => latest.current.start(),
      back: () => latest.current.back(),
      light: () => latest.current.light(),
    });
  });
}

export function useHardwareFire() {
  const ctx = useContext(HardwareContext);
  if (!ctx) throw new Error("Hardware missing");
  return ctx.fire;
}

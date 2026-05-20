import { useCallback, useRef } from "react";

function beep(ctx, freq, duration, type = "square", vol = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };

  const play = useCallback((name) => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      switch (name) {
        case "ready":
          beep(ctx, 440, 0.08);
          beep(ctx, 660, 0.1);
          break;
        case "tick":
          beep(ctx, 800, 0.03, "sine", 0.04);
          break;
        case "select":
          beep(ctx, 520, 0.06, "sine", 0.06);
          break;
        case "damage":
          beep(ctx, 120, 0.2, "sawtooth", 0.1);
          break;
        case "eliminate":
          beep(ctx, 80, 0.35, "sawtooth", 0.12);
          setTimeout(() => beep(ctx, 60, 0.4, "sawtooth", 0.1), 100);
          break;
        case "win":
          [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => beep(ctx, f, 0.15, "sine", 0.07), i * 120);
          });
          break;
        case "event":
          beep(ctx, 200, 0.15, "square", 0.09);
          beep(ctx, 400, 0.2, "square", 0.07);
          break;
        default:
          beep(ctx, 400, 0.05);
      }
      void t;
    } catch {
      /* audio blocked */
    }
  }, []);

  return { play };
}

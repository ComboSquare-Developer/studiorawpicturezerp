import { useEffect, useRef, useState } from "react";

const CURSOR_OFFSET_X = 14;
const CURSOR_OFFSET_Y = 16;
const LERP_FACTOR = 0.28;

function isTextEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest("textarea, [contenteditable='true']")) return true;
  const input = target.closest("input");
  if (!input) return false;
  const type = String(input.getAttribute("type") || "text").toLowerCase();
  return ![
    "button",
    "submit",
    "reset",
    "checkbox",
    "radio",
    "range",
    "color",
    "file",
    "image",
    "hidden",
  ].includes(type);
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "a, button, select, summary, [role='button'], [role='link'], label[for]"
    )
  );
}

/**
 * Application-wide animated custom mouse cursor using public/char-transparent.png.
 * Follows mouse movement via requestAnimationFrame without React re-renders,
 * preserves native cursor/caret fallback, and disables on touch or reduced-motion.
 */
export default function CharacterCursor() {
  const [enabled, setEnabled] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);

  const cursorRef = useRef(null);
  const actorRef = useRef(null);

  const targetRef = useRef({ x: -200, y: -200 });
  const currentRef = useRef({ x: -200, y: -200 });
  const stateRef = useRef({
    visible: false,
    hovering: false,
    clicking: false,
    textInput: false,
    lastMoveAt: 0,
  });
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncCapabilities = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches);
    };

    syncCapabilities();
    finePointer.addEventListener("change", syncCapabilities);
    reducedMotion.addEventListener("change", syncCapabilities);

    return () => {
      finePointer.removeEventListener("change", syncCapabilities);
      reducedMotion.removeEventListener("change", syncCapabilities);
    };
  }, []);

  useEffect(() => {
    if (!enabled || assetFailed) return;

    const renderFrame = (now) => {
      const container = cursorRef.current;
      const actor = actorRef.current;
      if (!container || !actor) {
        rafRef.current = 0;
        return;
      }

      const target = targetRef.current;
      const cur = currentRef.current;
      const st = stateRef.current;

      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.25) {
        cur.x = target.x;
        cur.y = target.y;
      } else {
        cur.x += dx * LERP_FACTOR;
        cur.y += dy * LERP_FACTOR;
      }

      container.style.transform = `translate3d(${cur.x + CURSOR_OFFSET_X}px, ${
        cur.y + CURSOR_OFFSET_Y
      }px, 0)`;

      // Hide gently on text inputs so native caret/selection remains completely clear
      const shouldShow = st.visible && !st.textInput;
      container.style.opacity = shouldShow ? "1" : "0";

      const isRecentlyMoving = now - st.lastMoveAt < 110 || dist > 1.2;
      const bounceY = isRecentlyMoving ? Math.sin(now * 0.022) * 2.4 : 0;
      const tiltDeg = isRecentlyMoving
        ? Math.max(-5, Math.min(5, dx * 0.16))
        : st.hovering
        ? -4
        : 0;
      const scale = st.clicking ? 0.88 : st.hovering ? 1.08 : 1;

      actor.style.transform = `translate3d(0, ${bounceY}px, 0) rotate(${tiltDeg}deg) scale(${scale})`;

      if (dist >= 0.25 || isRecentlyMoving || st.clicking) {
        rafRef.current = window.requestAnimationFrame(renderFrame);
      } else {
        rafRef.current = 0;
      }
    };

    const scheduleFrame = () => {
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(renderFrame);
      }
    };

    const onMouseMove = (e) => {
      const st = stateRef.current;
      if (!st.visible) {
        currentRef.current = { x: e.clientX, y: e.clientY };
      }
      targetRef.current = { x: e.clientX, y: e.clientY };
      st.visible = true;
      st.lastMoveAt = performance.now();
      st.textInput = isTextEditableTarget(e.target);
      st.hovering = !st.textInput && isInteractiveTarget(e.target);
      scheduleFrame();
    };

    const onMouseDown = () => {
      stateRef.current.clicking = true;
      scheduleFrame();
    };

    const onMouseUp = () => {
      stateRef.current.clicking = false;
      scheduleFrame();
    };

    const onMouseLeave = () => {
      stateRef.current.visible = false;
      stateRef.current.clicking = false;
      scheduleFrame();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("blur", onMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("blur", onMouseLeave);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [enabled, assetFailed]);

  if (!enabled || assetFailed) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[10000] select-none opacity-0 transition-opacity duration-150 will-change-transform"
    >
      <div
        ref={actorRef}
        className="transition-transform duration-100 ease-out will-change-transform"
      >
        <img
          src="/char-transparent.png"
          alt=""
          draggable={false}
          onError={() => setAssetFailed(true)}
          className="h-11 w-auto bg-transparent object-contain"
        />
      </div>
    </div>
  );
}

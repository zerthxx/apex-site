"use client";

import { useEffect, useState, type RefObject } from "react";

type MarginValue = `${number}${"px" | "%"}`;

/**
 * Reveals an element once it comes within `margin` of the viewport, and keeps
 * checking on every scroll/resize until it does — instead of relying solely
 * on IntersectionObserver's callback. A large or fast scroll (keyboard End,
 * anchor jumps, scroll restoration, a quick trackpad flick) can move the
 * viewport past an element between observer checks, so the callback never
 * fires and a `once: true` reveal stays hidden forever even though the
 * element is now sitting in (or already past) the viewport. A debounced
 * re-check after scrolling settles also guards against a gesture stopping
 * with the element's edge exactly on the margin boundary at the last
 * `scroll` event, and a visibilitychange re-check covers a tab that was
 * backgrounded mid-scroll (background tabs throttle timers).
 */
export function useRevealInView(
  ref: RefObject<Element | null>,
  margin: MarginValue = "-80px",
) {
  const [visible, setVisible] = useState(false);
  const marginPx = Math.abs(parseFloat(margin));

  useEffect(() => {
    if (visible) return;

    let settleTimer: ReturnType<typeof setTimeout>;
    function check() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const isPast = rect.bottom <= 0;
      const isWithinViewport =
        rect.bottom > marginPx && rect.top < window.innerHeight - marginPx;
      if (isPast || isWithinViewport) {
        setVisible(true);
      }
    }
    function checkAndScheduleSettleCheck() {
      check();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(check, 200);
    }

    check();
    window.addEventListener("scroll", checkAndScheduleSettleCheck, {
      passive: true,
    });
    window.addEventListener("resize", checkAndScheduleSettleCheck, {
      passive: true,
    });
    document.addEventListener("visibilitychange", check);
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", checkAndScheduleSettleCheck);
      window.removeEventListener("resize", checkAndScheduleSettleCheck);
      document.removeEventListener("visibilitychange", check);
    };
  }, [visible, ref, marginPx]);

  return visible;
}

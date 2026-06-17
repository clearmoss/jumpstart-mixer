import { useEffect, useRef, type RefObject } from "react";

interface UseSwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftEdgeThreshold?: number;
  rightEdgeThreshold?: number;
  swipeThreshold?: number;
  breakpoint?: number;
  enabled?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  leftEdgeThreshold,
  rightEdgeThreshold,
  swipeThreshold = 60,
  breakpoint = 768,
  enabled = true,
  targetRef,
}: UseSwipeGestureProps) {
  // store callbacks in a ref. this ensures that if the parent component re-renders
  // and passes new callback functions, we don't unnecessarily tear down and reattach
  // the DOM event listeners, which is expensive and can cause missed gestures
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight });
  useEffect(() => {
    callbacksRef.current = { onSwipeLeft, onSwipeRight };
  }, [onSwipeLeft, onSwipeRight]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    // determine the target element to attach listeners to
    // fall back to the window if no specific ref is provided
    const targetElement = targetRef?.current || window;

    const isMobile = () => window.innerWidth < breakpoint;

    const handleTouchStart: EventListener = (e) => {
      if (!isMobile()) return;

      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      const { clientX, clientY } = touch;
      const windowWidth = window.innerWidth;

      const matchesLeft = leftEdgeThreshold
        ? clientX <= leftEdgeThreshold
        : false;
      const matchesRight = rightEdgeThreshold
        ? clientX >= windowWidth - rightEdgeThreshold
        : false;
      const hasNoThresholds = !leftEdgeThreshold && !rightEdgeThreshold;

      if (matchesLeft || matchesRight || hasNoThresholds) {
        touchStartRef.current = { x: clientX, y: clientY };
        isHorizontalSwipeRef.current = false;
      }
    };

    const handleTouchMove: EventListener = (e) => {
      if (!touchStartRef.current) return;

      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (!isHorizontalSwipeRef.current) {
        // jitter: the user must move at least 10px horizontally, and the
        // horizontal movement must be greater than vertical movement.
        // this prevents slightly diagonal scrolling from locking the screen into a swipe.
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
          isHorizontalSwipeRef.current = true;
        }
      }

      if (isHorizontalSwipeRef.current && e.cancelable) {
        // iOS fix: by preventing default here, we stop Safari from
        // triggering its native "swipe right from edge to go back" browser navigation
        // while the user is trying to interact with our specific UI element
        e.preventDefault();
      }
    };

    const handleTouchEnd: EventListener = (e) => {
      if (!touchStartRef.current || !isHorizontalSwipeRef.current) return;

      const touchEvent = e as TouchEvent;
      const touch = touchEvent.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // reset state for the next gesture
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = false;

      // ensure the swipe distance met our intentionality threshold (default 50px)
      if (
        Math.abs(deltaX) < swipeThreshold ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      const { onSwipeLeft: swipeLeftCb, onSwipeRight: swipeRightCb } =
        callbacksRef.current;

      if (deltaX < 0 && swipeLeftCb) {
        // swipe left
        swipeLeftCb();
      } else if (deltaX > 0 && swipeRightCb) {
        // swipe right
        swipeRightCb();
      }
    };

    // pass { passive: false } to touchmove. if we don't, the browser treats it as
    // passive by default to optimize scrolling performance, meaning our e.preventDefault()
    // call above would be ignored and throw a console warning
    targetElement.addEventListener("touchstart", handleTouchStart);
    targetElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    targetElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      targetElement.removeEventListener("touchstart", handleTouchStart);
      targetElement.removeEventListener("touchmove", handleTouchMove);
      targetElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    enabled,
    leftEdgeThreshold,
    rightEdgeThreshold,
    swipeThreshold,
    breakpoint,
    targetRef,
  ]);
}

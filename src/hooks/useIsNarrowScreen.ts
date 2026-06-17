import { useSyncExternalStore } from "react";

const NARROW_SCREEN_QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(NARROW_SCREEN_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(NARROW_SCREEN_QUERY).matches;
}

export function useIsNarrowScreen() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

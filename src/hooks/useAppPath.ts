import {
  isDemoPath,
  useAppPathContext,
} from "../context/AppPathContext";

export { isDemoPath };

export function useAppPath() {
  return useAppPathContext();
}

export type UseAppPathResult = ReturnType<typeof useAppPath>;

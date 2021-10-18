import { useState, useMemo } from "react";
import useResizeObserver from "use-resize-observer";
import { debounce } from "../lib/debounce";

export const useDebouncedResizeObserver = (wait: number) => {
  const [size, setSize] = useState<HTMLElement>({} as HTMLElement);
  const onResize = useMemo(() => debounce(setSize, wait), [wait]);
  const { ref } = useResizeObserver({ onResize });
  return { ref, ...size };
};

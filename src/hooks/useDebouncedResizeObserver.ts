import { useState, useMemo } from "react";
import useResizeObserver from "use-resize-observer";
import { debounce } from "../lib/debounce";

type ObservedSize = {
  width: number;
  height: number;
}

export const useDebouncedResizeObserver = (wait: number) => {
  const [size, setSize] = useState<ObservedSize>({} as ObservedSize);
  const onResize = useMemo(() => debounce(setSize, wait), [wait]);
  const { ref } = useResizeObserver({ onResize });
  return { ref, ...size };
};

import { useState, useEffect } from 'react';

const getWindowIsActive = () => {
  if (typeof document === "undefined") return true;
  return document.visibilityState === 'visible';
};

export const useWindowIsActive = (): boolean => {
  const [isActive, setIsActive] = useState(getWindowIsActive());

  function handleVisibility() {
    setIsActive(getWindowIsActive());
  }

  useEffect(() => {
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return isActive;
};

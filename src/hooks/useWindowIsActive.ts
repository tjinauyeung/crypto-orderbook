import { useState, useEffect } from 'react';

const getVisibility = () => {
  if (typeof document === "undefined") return true;
  return document.visibilityState;
};

export const useWindowIsActive = () => {
  let [isActive, setIsActive] = useState(getVisibility());

  function handleVisibility() {
    setIsActive(getVisibility());
  }

  useEffect(() => {
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return isActive;
};

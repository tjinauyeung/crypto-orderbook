export const throttle = <T extends (...args: any) => any>(
  func: T,
  limit: number
) => {
  let inThrottle;
  return function (P: any) {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

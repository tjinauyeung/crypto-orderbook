export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(price);
};

export const formatNumber = (value: number, minDigits = 0) => {
  const formatter = new Intl.NumberFormat("us", { minimumFractionDigits: minDigits });
  return formatter.format(value);
};

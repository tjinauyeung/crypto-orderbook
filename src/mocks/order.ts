import { OrderMessage, OrderFeedData } from "../types";

export const makeOrderMessage = (
  overrides: Partial<OrderMessage> = {}
): OrderMessage => ({
  numLevels: 25,
  feed: "book_ui_1_snapshot",
  bids: [
    [61907.0, 4115.0],
    [61904.5, 8638.0],
    [61900.0, 4346.0],
    [61897.0, 4533.0],
    [61896.0, 14810.0],
  ],
  asks: [
    [61913.5, 604.0],
    [61920.5, 1000.0],
    [61924.5, 5528.0],
    [61933.5, 3000.0],
    [61934.0, 7582.0],
  ],
  product_id: "PI_XBTUSD",
  ...overrides,
});

export const makeOrderFeedData = (
  overrides: Partial<OrderFeedData> = {}
): OrderFeedData => ({
  spread: {
    amount: 0,
    percentage: 0,
  },
  maxTotals: {
    bid: 15000,
    ask: 15000,
  },
  bids: [
    [61907.0, 4000, 4000],
    [61904.5, 2000, 6000],
    [61900.0, 1000, 7000],
    [61897.0, 3000, 10000],
    [61896.0, 5000, 15000],
  ],
  asks: [
    [61913.5, 4000, 4000],
    [61920.5, 2000, 6000],
    [61924.5, 1000, 7000],
    [61933.5, 3000, 10000],
    [61934.0, 5000, 15000],
  ],
  ...overrides,
});

export enum SocketState {
  connecting,
  connected,
  closed,
  error,
}

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell'
}

export type Price = number;
export type Size = number;
export type Total = number;

export type OrderSnapshot = {
  asks: OrderMessage[];
  bids: OrderMessage[];
}

export type OrderMessage = [Price, Size];

export interface FeedData {
  bids: Order[];
  asks: Order[];
  spread: {
    amount: number;
    percentage: number;
  };
  maxTotals: {
    bid: number;
    ask: number;
  }
}

export type Order = [Price, Size, Total?];

export type MaxTotals = {
  ask: number;
  bid: number;
};

export type Spread = {
  amount: number;
  percentage: number;
}

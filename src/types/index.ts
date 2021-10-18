export enum SocketState {
  connecting,
  connected,
  closed,
  error,
}

export type Price = number;
export type Size = number;
export type Total = number;

export type OrderSnapshot = {
  asks: OrderMessage[];
  bids: OrderMessage[];
}

export type OrderMessage = [Price, Size];

export interface OrderData {
  bids: Order[];
  asks: Order[];
  spread: {
    amount: number;
    percentage: number;
  };
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

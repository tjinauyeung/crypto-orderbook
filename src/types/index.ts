export enum SocketState {
  connecting,
  connected,
  closed,
  error,
}

export enum OrderType {
  BUY = "buy",
  SELL = "sell",
}

export type Price = number;
export type Size = number;
export type Total = number;

export type Order = [Price, Size, Total?];

export type MaxTotals = {
  ask: number;
  bid: number;
};

export type Spread = {
  amount: number;
  percentage: number;
};

export type OrderSnapshotMessage = {
  numLevels: number;
  asks: Order[];
  bids: Order[];
  feed: string;
  product_id: string;
};

export type OrderUpdateMessage = {
  asks: Order[];
  bids: Order[];
  feed: string;
  product_id: string;
};

export type OrderMessage = OrderSnapshotMessage | OrderUpdateMessage;

export interface OrderFeedData {
  bids: Order[];
  asks: Order[];
  spread: Spread;
  maxTotals: MaxTotals;
}

export type SubscriptionMessage = {
  event: 'subscribe' | 'subscribed' | 'unsubscribe' | 'unsubscribed';
  product_ids: string[];
}

export type Message = OrderMessage | SubscriptionMessage;

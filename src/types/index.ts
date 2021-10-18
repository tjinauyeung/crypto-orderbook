export enum SocketState {
  connecting = 1,
  connected = 2,
  subscribed = 3,
  closed = 4,
}

export type Price = number;
export type Size = number;
export type Total = number;

export type OrderMessage = [Price, Size];
export type OrderMessages = OrderMessage[];

export type Orders = Order[];
export type Order = [Price, Size, Total];

export type MaxTotals = {
  ask: number;
  bid: number;
};

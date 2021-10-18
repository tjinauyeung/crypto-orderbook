import { Order, FeedData, OrderMessage, OrderSnapshot, Spread } from "../types";

export function mapOrderSnapshot(orders: OrderSnapshot): FeedData {
  const asks = processOrders(orders.asks);
  const bids = processOrders(orders.bids);
  return {
    asks: asks.orders,
    bids: bids.orders,
    spread: calcSpread(orders.bids[0][0], orders.asks[0][0]),
    maxTotals: {
      ask: asks.maxTotal,
      bid: bids.maxTotal,
    },
  };
}

export function mapOrderUpdates(
  orders: FeedData,
  orderUpdates: OrderSnapshot
): FeedData {
  const asks = processUpdates(
    orders.asks as OrderMessage[],
    orderUpdates.asks,
    true
  );
  const bids = processUpdates(
    orders.bids as OrderMessage[],
    orderUpdates.bids,
    false
  );
  return {
    asks: orderUpdates.asks.length > 0 ? asks.orders : orders.asks,
    bids: orderUpdates.bids.length > 0 ? bids.orders : orders.bids,
    spread: calcSpread(orders.bids[0][0], orders.asks[0][0]),
    maxTotals: {
      ask: asks.maxTotal,
      bid: bids.maxTotal,
    },
  };
}

function calcSpread(maxBid: number, minAsk: number): Spread {
  const amount = Math.abs(maxBid - minAsk);
  const percentage = (amount / minAsk) * 100;
  return {
    amount,
    percentage
  }
}

function processOrders(messages: OrderMessage[]): {
  orders: Order[];
  maxTotal: number;
} {
  let total = 0;
  const orders = [];

  for (const [price, size] of messages) {
    orders.push([price, size, (total += size)]);
  }

  return {
    orders,
    maxTotal: total,
  };
}

function processUpdates(
  orders: OrderMessage[],
  orderUpdates: OrderMessage[],
  sortAsc: boolean
): { orders: Order[]; maxTotal: number } {
  let copy = JSON.parse(JSON.stringify(orders));

  for (const [price, size] of orderUpdates) {
    const idx = copy.findIndex((el) => el[0] == price);
    if (idx !== -1) {
      if (size === 0) {
        // remove from copy
        copy = [...copy.slice(0, idx), ...copy.slice(idx + 1)];
      } else {
        copy[idx] = [price, size];
      }
    } else {
      if (size > 0) {
        copy.push([price, size]);
      }
    }
  }

  return processOrders(copy.sort(sortAsc ? sortAscFn : sortDescFn));
}

const sortAscFn = (a: OrderMessage, b: OrderMessage) => (a[0] > b[0] ? 1 : -1);
const sortDescFn = (a: OrderMessage, b: OrderMessage) => (a[0] < b[0] ? 1 : -1);

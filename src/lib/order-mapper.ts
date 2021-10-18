import { Order, OrderFeedData, OrderMessage, Spread } from "../types";

export function mapOrderFeed(message: OrderMessage): OrderFeedData {
  const asks = processOrders(message.asks);
  const bids = processOrders(message.bids);
  return {
    asks: asks.orders,
    bids: bids.orders,
    spread: getSpread({ asks: message.asks, bids: message.bids }),
    maxTotals: {
      ask: asks.maxTotal,
      bid: bids.maxTotal,
    },
  };
}

export function mapOrderFeedUpdates(
  orders: OrderFeedData,
  message: OrderMessage
): OrderFeedData {
  const asks = processUpdates(orders.asks, message.asks, true);
  const bids = processUpdates(orders.bids, message.bids, false);
  return {
    asks: message.asks.length > 0 ? asks.orders : orders.asks,
    bids: message.bids.length > 0 ? bids.orders : orders.bids,
    spread: getSpread({ asks: orders.asks, bids: orders.bids }),
    maxTotals: {
      ask: asks.maxTotal,
      bid: bids.maxTotal,
    },
  };
}

function getSpread({ asks, bids }: { asks: Order[]; bids: Order[] }): Spread {
  let maxBid, minAsk;

  if (bids.length) {
    const [price] = bids[0];
    maxBid = price;
  }

  if (asks.length) {
    const [price] = asks[0];
    minAsk = price;
  }

  if (!maxBid || !minAsk) {
    return {
      amount: 0,
      percentage: 0,
    };
  }

  return calcSpread(maxBid, minAsk);
}

function calcSpread(maxBid: number, minAsk: number): Spread {
  const amount = Math.abs(maxBid - minAsk);
  const percentage = (amount / minAsk) * 100;
  return {
    amount,
    percentage,
  };
}

type ProcessedOrder = {
  orders: Order[];
  maxTotal: number;
};

function processOrders(messages: Order[]): ProcessedOrder {
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
  orders: Order[],
  orderUpdates: Order[] = [],
  sortAsc: boolean
): ProcessedOrder {
  let copy = [...orders];

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

const sortAscFn = (a: Order, b: Order) => (a[0] > b[0] ? 1 : -1);
const sortDescFn = (a: Order, b: Order) => (a[0] < b[0] ? 1 : -1);

import { Order, OrderData, OrderMessage, OrderSnapshot } from "../types";

export function mapOrderSnapshot(orders: OrderSnapshot): OrderData {
  const spreadAmount = orders.bids[0][0] - orders.asks[0][0];
  const spreadPercentage = (spreadAmount / orders.asks[0][0]) * 100;
  return {
    asks: mapOrders(orders.asks),
    bids: mapOrders(orders.bids),
    spread: {
      amount: spreadAmount,
      percentage: spreadPercentage,
    },
  };
}

export function mapOrderUpdates(
  orders: OrderData,
  orderUpdates: OrderSnapshot
): OrderData {
  const spreadAmount = orders.asks[0][0] - orders.bids[0][0];
  const spreadPercentage = (spreadAmount / orders.asks[0][0]) * 100;
  return {
    asks:
      orderUpdates.asks.length > 0
        ? updateOrder(orders.asks as OrderMessage[], orderUpdates.asks, false)
        : orders.asks,
    bids:
      orderUpdates.bids.length > 0
        ? updateOrder(orders.bids as OrderMessage[], orderUpdates.bids, true)
        : orders.bids,
    spread: {
      amount: spreadAmount,
      percentage: spreadPercentage,
    },
  };
}

export function mapOrders(messages: OrderMessage[]): Order[] {
  let total = 0;
  const res = [];

  for (const [price, size] of messages) {
    res.push([price, size, (total += size)]);
  }

  return res;
}

export function updateOrder(
  orders: OrderMessage[],
  orderUpdates: OrderMessage[],
  sortAsc: boolean
): Order[] {
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

  return mapOrders(copy.sort(sortAsc ? sortAscFn : sortDescFn));
}

const sortAscFn = (a: OrderMessage, b: OrderMessage) => (a[0] > b[0] ? 1 : -1);
const sortDescFn = (a: OrderMessage, b: OrderMessage) => (a[0] < b[0] ? 1 : -1);

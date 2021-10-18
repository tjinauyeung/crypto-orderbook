import React, { createContext, Dispatch, MutableRefObject, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { MaxTotals, OrderMessages, Orders, SocketState } from "../types";

type Feed = {
  asks: Orders;
  bids: Orders;
  ws: MutableRefObject<WebSocket>;
  status: SocketState;
  spread: number;
  maxTotals: {
    ask: number;
    bid: number;
  };
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  toggleFeed: () => void;
  feed: string;
};

const FeedContext = createContext({} as Feed);

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
  const ws = useRef<WebSocket>(null);

  const [status, setStatus] = useState<SocketState>(SocketState.connecting);
  const [paused, setPaused] = useState<boolean>(false);
  const [feed, setFeed] = useState("PI_XBTUSD");
  const prevFeed = usePrevious(feed);

  const [maxTotals, setMaxTotals] = useState<MaxTotals>({ ask: 0, bid: 0 });

  const [orders, setOrders] = useState<{ asks: Orders; bids: Orders; spread: number }>({ asks: [], bids: [], spread: 0 });

  useEffect(() => {
    ws.current = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
    ws.current.onopen = () => {
      console.log("connected");
      setStatus(SocketState.connected);
    };
    ws.current.onclose = () => {
      console.log("closed");
      setStatus(SocketState.closed);
    };
    return () => ws.current.close();
  }, []);

  useEffect(() => {
    if (status === SocketState.connected) {
      if (!paused) {
        subscribe(feed, ws.current);
      }
    }
    if (paused) {
      unsubscribe(feed, ws.current);
    }
  }, [status, paused]);

  useEffect(() => {
    if (status === SocketState.subscribed) {
      unsubscribe(prevFeed, ws.current);
      subscribe(feed, ws.current);
    }
  }, [feed, prevFeed]);

  const toggleFeed = () => {
    setFeed((feed) => (feed === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD"));
  };

  const subscribe = useCallback(
    (productId, ws: WebSocket) => {
      ws.send(
        JSON.stringify({
          event: "subscribe",
          feed: "book_ui_1",
          product_ids: [productId],
        })
      );
    },
    [ws]
  );

  const unsubscribe = useCallback(
    (productId, ws: WebSocket) => {
      ws.send(
        JSON.stringify({
          event: "unsubscribe",
          feed: "book_ui_1",
          product_ids: [productId],
        })
      );
    },
    [ws]
  );

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = handleMessage;
  }, []);

  const handleMessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.event === "subscribed") {
      setStatus(SocketState.subscribed);
      return;
    }
    if (msg.event === "unsubscribe") {
      setOrders({
        asks: [],
        bids: [],
        spread: 0,
      });
      return;
    }
    if (msg.feed === "book_ui_1_snapshot") {
      setOrders({
        asks: mapOrders(msg.asks, true),
        bids: mapOrders(msg.bids, false),
        spread: msg.bids[0][0] - msg.asks[0][0],
      });
      return;
    }
    if (msg.feed === "book_ui_1") {
      updateOrders(msg);
      return;
    }
  };

  const updateOrders = throttle((msg: any) => {
    setOrders((o) => {
      return {
        asks: msg.asks.length > 0 ? mapUpdates(o.asks, msg.asks, true) : o.asks,
        bids: msg.bids.length > 0 ? mapUpdates(o.bids, msg.bids, false) : o.bids,
        spread: o.asks[0][0] - o.bids[0][0],
      };
    });
  }, 500);

  const mapOrders = (orders: OrderMessages, isAsk: boolean): Orders => {
    let total = 0;
    const res = [];

    for (const [price, size] of orders) {
      res.push([price, size, (total += size)]);
    }

    setMaxTotals((t) => ({
      ...t,
      [isAsk ? "ask" : "bid"]: total,
    }));

    return res;
  };

  const mapUpdates = useCallback((current, updates: Orders, isAsk) => {
    let copy = [...current];
    for (const [price, size] of updates) {
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

    return mapOrders(
      copy.sort((a, b) => (isAsk ? (a[0] > b[0] ? 1 : -1) : a[0] < b[0] ? 1 : -1)),
      isAsk
    );
  }, []);

  return <FeedContext.Provider value={{ ws, status, asks: orders.asks, bids: orders.bids, spread: orders.spread, maxTotals, paused, setPaused, toggleFeed, feed }}>{children}</FeedContext.Provider>;
};

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

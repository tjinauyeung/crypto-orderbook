import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { usePrevious } from "../hooks/usePrevious";
import { MaxTotals, Order, OrderData, SocketState, Spread } from "../types";
import { throttle } from "../utils/throttle";
import * as mapper from "../services/order-mapper";

type Feed = {
  asks: Order[];
  bids: Order[];
  spread: Spread;
  maxTotals: {
    ask: number;
    bid: number;
  };

  isPaused: boolean;
  pause: () => void;
  start: () => void;

  feed: string;
  toggleFeed: () => void;

  isLoading: boolean;
};

const FeedContext = createContext({} as Feed);

export const useFeed = () => useContext(FeedContext);

const INITIAL_ORDER_STATE = {
  asks: [],
  bids: [],
  spread: {
    amount: 0,
    percentage: 0,
  },
};

const FEED = {
  BTCUSD: "PI_XBTUSD",
  ETHUSD: "PI_ETHUSD",
};

const SOCKET_URL = "wss://www.cryptofacilities.com/ws/v1";

export const FeedProvider = ({ children }) => {
  const { status, sendMessage } = useWebSocket({
    url: SOCKET_URL,
    onMessage: handleMessage,
  });

  const [feed, setFeed] = useState(FEED.BTCUSD);
  const prevFeed = usePrevious(feed);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [maxTotals, setMaxTotals] = useState<MaxTotals>({ ask: 0, bid: 0 });
  const [orders, setOrders] = useState<OrderData>(INITIAL_ORDER_STATE);

  function handleMessage(message) {
    if (message.event === "subscribed") {
      return setIsSubscribed(true);
    }
    if (message.event === "unsubscribe") {
      setOrders(INITIAL_ORDER_STATE);
      return setIsSubscribed(false);
    }
    if (message.feed === "book_ui_1_snapshot") {
      return setOrders(mapper.mapOrderSnapshot(message));
    }
    if (message.feed === "book_ui_1") {
      return throttle(setOrders(o => mapper.mapOrderUpdates(o, message)), 500);
    }
  }

  useEffect(() => {
    if (status === SocketState.connected) {
      if (!isPaused) {
        subscribe(feed);
      }
    }
    if (isPaused) {
      unsubscribe(feed);
    }
  }, [status, isPaused]);

  useEffect(() => {
    if (status === SocketState.connected && isSubscribed) {
      // unsubscribe from previous feed
      unsubscribe(prevFeed);
      // resubscribe with new feed
      subscribe(feed);
    }
  }, [feed, prevFeed]);

  const toggleFeed = () => {
    setFeed((feed) => (feed === FEED.BTCUSD ? FEED.ETHUSD : FEED.BTCUSD));
  };

  const subscribe = useCallback(
    (productId) => {
      sendMessage({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      });
    },
    [sendMessage]
  );

  const unsubscribe = useCallback(
    (productId) => {
      sendMessage({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      });
    },
    [sendMessage]
  );

  useEffect(() => {
    if (orders.bids[orders.bids.length] && orders.asks[orders.asks.length]) {
      setMaxTotals({
        bid: orders.bids[orders.bids.length][2],
        ask: orders.asks[orders.asks.length][2],
      });
    }
  }, [orders]);

  return (
    <FeedContext.Provider
      value={{
        isLoading: isSubscribed,
        asks: orders.asks,
        bids: orders.bids,
        spread: orders.spread,
        maxTotals,

        isPaused,
        start: () => setIsPaused(false),
        pause: () => setIsPaused(true),

        toggleFeed,
        feed,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

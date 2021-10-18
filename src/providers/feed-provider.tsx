import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { usePrevious } from "../hooks/usePrevious";
import { FeedData, OrderSnapshot, SocketState } from "../types";
import { throttle } from "../lib/throttle";
import * as mapper from "../lib/order-mapper";

type Feed = {
  data: FeedData;
  feed: string;
  isLoading: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  toggleFeed: () => void;
};

const FeedContext = createContext({} as Feed);

const SOCKET_URL = "wss://www.cryptofacilities.com/ws/v1";

const FEED = {
  BTCUSD: "PI_XBTUSD",
  ETHUSD: "PI_ETHUSD",
};

const INITIAL_DATA = {
  asks: [],
  bids: [],
  spread: {
    amount: 0,
    percentage: 0,
  },
  maxTotals: {
    ask: 0,
    bid: 0,
  },
};

export const FeedProvider = ({ children }) => {
  const { status, sendMessage } = useWebSocket({
    url: SOCKET_URL,
    onMessage: handleMessage,
  });

  const [data, setData] = useState<FeedData>(INITIAL_DATA);

  const [feed, setFeed] = useState(FEED.BTCUSD);
  const prevFeed = usePrevious(feed);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function handleMessage(message) {
    console.log(message);
    if (message.event === "subscribed") {
      return setIsSubscribed(true);
    }
    if (message.event === "unsubscribed") {
      setData(INITIAL_DATA);
      return setIsSubscribed(false);
    }
    if (message.feed === "book_ui_1_snapshot") {
      return setData(mapper.mapOrderSnapshot(message));
    }
    if (message.feed === "book_ui_1") {
      return updateFeed(message);
    }
  }

  const updateFeed = throttle((message: OrderSnapshot) => {
    setData((o) => mapper.mapOrderUpdates(o, message));
  }, 2000);

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
      unsubscribe(prevFeed);
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

  return (
    <FeedContext.Provider
      value={{
        data,
        feed,
        isLoading: !isSubscribed,
        isPaused,
        pause: () => setIsPaused(true),
        resume: () => setIsPaused(false),
        toggleFeed,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);

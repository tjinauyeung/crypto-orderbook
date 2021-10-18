import React, {
  createContext,
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
  isError: boolean;
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

const THROTTLE_TIME = 2000;

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
  }, THROTTLE_TIME);

  useEffect(() => {
    if (isPaused) {
      return unsubscribe(feed);
    }
    if (status === SocketState.connected) {
      subscribe(feed);
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

  const subscribe = (feed: string) => {
    sendMessage({
      event: "subscribe",
      feed: "book_ui_1",
      product_ids: [feed],
    });
  };

  const unsubscribe = (feed: string) => {
    sendMessage({
      event: "unsubscribe",
      feed: "book_ui_1",
      product_ids: [feed],
    });
  };

  return (
    <FeedContext.Provider
      value={{
        data,
        feed,
        isLoading: !isSubscribed,
        isError: status === SocketState.error,
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

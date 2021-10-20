import {
  Message,
  SubscriptionMessage,
  OrderSnapshotMessage,
  OrderUpdateMessage,
} from "../types";

export const isSubscribedMessage = (
  message: Message
): message is SubscriptionMessage =>
  "event" in message && message.event === "subscribed";

export const isUnsubscribedMessage = (
  message: Message
): message is SubscriptionMessage =>
  "event" in message && message.event === "unsubscribed";

export const isOrderSnapshotMessage = (
  message: Message
): message is OrderSnapshotMessage =>
  "feed" in message && message.feed === "book_ui_1_snapshot";

export const isOrderUpdateMessage = (
  message: Message
): message is OrderUpdateMessage =>
  "feed" in message && message.feed === "book_ui_1";

export const makeMessage = (event: string, feed: string) => ({
  event,
  feed: "book_ui_1",
  product_ids: [feed],
});

import React from "react";
import "twin.macro";
import "./app.css";
import { FeedProvider } from "../../providers/feed-provider";
import { OrderBook } from "../order-book/order-book";

export const App = () => (
  <FeedProvider>
    <OrderBook />
  </FeedProvider>
);

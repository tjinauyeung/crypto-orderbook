import React from "react";
import "twin.macro";
import "./app.css";
import { OrderFeedProvider } from "../../providers/order-feed-provider";
import { OrderBook } from "../order-book/order-book";

export const App = () => (
  <OrderFeedProvider>
    <OrderBook />
  </OrderFeedProvider>
);

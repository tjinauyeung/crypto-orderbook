import "../../mocks/resize-observer";
import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderBook } from "./order-book";
import {
  OrderFeedProvider,
  ORDER_FEED,
  SOCKET_URL,
} from "../../providers/order-feed-provider";
import userEvent from "@testing-library/user-event";
import WS from "jest-websocket-mock";
import { makeMessage } from "../../lib/message";
import { makeOrderMessage } from "../../mocks/order";
import { formatPrice } from "../../lib/formatters";

describe("OrderBook", () => {
  let server: WS;

  beforeEach(() => {
    server = new WS(SOCKET_URL, { jsonProtocol: true });
  });

  afterEach(() => {
    WS.clean();
  });

  describe("loading", () => {
    it("renders a loading screen when initialising", async () => {
      render(
        <OrderFeedProvider>
          <OrderBook />
        </OrderFeedProvider>
      );
      await server.connected;
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("closed", () => {
    it("renders a message when socket closes", async () => {
      render(
        <OrderFeedProvider>
          <OrderBook />
        </OrderFeedProvider>
      );

      await server.connected;
      server.close();

      expect(screen.getByText("Closed feed.")).toBeInTheDocument();
    });
  });

  describe("feed", () => {
    it("subscribes to the XBTUSD feed", async () => {
      render(
        <OrderFeedProvider>
          <OrderBook />
        </OrderFeedProvider>
      );

      await server.connected;
      await expect(server).toReceiveMessage(
        makeMessage("subscribe", ORDER_FEED.BTCUSD)
      );
    });

    describe("toggle feed", () => {
      it("switches the feed when the toggle feed button is clicked", async () => {
        render(
          <OrderFeedProvider>
            <OrderBook />
          </OrderFeedProvider>
        );

        await server.connected;

        await expect(server).toReceiveMessage(
          makeMessage("subscribe", ORDER_FEED.BTCUSD)
        );
        server.send(makeMessage("subscribed", ORDER_FEED.BTCUSD));

        expect(screen.getByText("BTC / USD")).toBeInTheDocument();

        userEvent.click(screen.getByText("Toggle feed"));

        await expect(server).toReceiveMessage(
          makeMessage("unsubscribe", ORDER_FEED.BTCUSD)
        );
        await expect(server).toReceiveMessage(
          makeMessage("subscribe", ORDER_FEED.ETHUSD)
        );

        expect(screen.getByText("ETH / USD")).toBeInTheDocument();
      });
    });

    it("renders the feed data", async () => {
      render(
        <OrderFeedProvider>
          <OrderBook />
        </OrderFeedProvider>
      );

      await server.connected;
      server.send(makeMessage("subscribed", ORDER_FEED.BTCUSD));

      const message = makeOrderMessage();
      server.send(message);

      const idxPrice = 0;

      expect(
        screen.getByText(formatPrice(message.bids[0][idxPrice]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(message.bids[1][idxPrice]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(message.bids[2][idxPrice]))
      ).toBeInTheDocument();

      expect(
        screen.getByText(formatPrice(message.asks[4][idxPrice]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(message.asks[3][idxPrice]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(message.asks[2][idxPrice]))
      ).toBeInTheDocument();

      // ...add more assertions
    });
  });
});

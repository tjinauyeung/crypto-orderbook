import { mapOrderFeed, mapOrderFeedUpdates } from "./order-mapper";
import { makeOrderMessage, makeOrderFeedData } from "../mocks/order";

// The index in the Order tuple / triple
// [ price, size, total ]
const idx = {
  price: 0,
  size: 1,
  total: 2,
};

describe("mapOrderFeed", () => {
  describe("totals", () => {
    it("returns empty array if no orders are passed", () => {
      const result = mapOrderFeed(makeOrderMessage({ bids: [], asks: [] }));
      expect(result.bids).toHaveLength(0);
      expect(result.asks).toHaveLength(0);
    });

    it("calculates the totals based the accumulated size of bids lower than the current bid", () => {
      const result = mapOrderFeed(
        makeOrderMessage({
          bids: [
            [101, 10],
            [102, 20],
            [103, 30],
            [104, 40],
            [105, 50],
          ],
        })
      );
      expect(result.bids[0][idx.total]).toBe(10);
      expect(result.bids[1][idx.total]).toBe(30);
      expect(result.bids[2][idx.total]).toBe(60);
      expect(result.bids[3][idx.total]).toBe(100);
      expect(result.bids[4][idx.total]).toBe(150);
    });

    it("calculates the totals based the accumulated size of asks higher than the current ask", () => {
      const result = mapOrderFeed(
        makeOrderMessage({
          asks: [
            [105, 10],
            [104, 20],
            [103, 30],
            [102, 40],
            [101, 50],
          ],
        })
      );
      expect(result.asks[0][idx.total]).toBe(10);
      expect(result.asks[1][idx.total]).toBe(30);
      expect(result.asks[2][idx.total]).toBe(60);
      expect(result.asks[3][idx.total]).toBe(100);
      expect(result.asks[4][idx.total]).toBe(150);
    });
  });

  describe("maxTotals", () => {
    it("returns zero if no orders are passed", () => {
      const result = mapOrderFeed(makeOrderMessage({ bids: [], asks: [] }));
      expect(result.maxTotals.bid).toBe(0);
      expect(result.maxTotals.ask).toBe(0);
    });

    it("returns the accumulative size of all ask orders", () => {
      const result = mapOrderFeed(makeOrderMessage());
      expect(result.maxTotals.ask).toBe(17714);
    });

    it("returns the accumulative size of all bid orders", () => {
      const result = mapOrderFeed(makeOrderMessage());
      expect(result.maxTotals.bid).toBe(36442);
    });
  });

  describe("spread", () => {
    it("returns the spread amount as the difference between highest bid and lowest ask", () => {
      const result = mapOrderFeed(
        makeOrderMessage({
          bids: [[61956, 10]],
          asks: [[61966.5, 200]],
        })
      );
      expect(result.spread.amount).toBe(10.5);
    });

    it("returns the spread percentage as the spread amount divided by the ask price", () => {
      const result = mapOrderFeed(
        makeOrderMessage({
          bids: [[798, 10]],
          asks: [[800, 10]],
        })
      );
      expect(result.spread.percentage).toBe(0.25);
    });
  });
});

describe("mapOrderFeedUpdates", () => {
  describe("orders", () => {
    it("updates the current orders based on the received delta and returns a new list", () => {
      const old = makeOrderFeedData();
      const result = mapOrderFeedUpdates(
        old,
        makeOrderMessage({
          asks: [[61933.5, 3200]],
        })
      );

      expect(result.asks).toHaveLength(old.asks.length); // length unchanged
      expect(result.asks[0][idx.size]).toBe(old.asks[0][idx.size]);
      expect(result.asks[1][idx.size]).toBe(old.asks[1][idx.size]);
      expect(result.asks[2][idx.size]).toBe(old.asks[2][idx.size]);
      expect(result.asks[3][idx.size]).not.toBe(old.asks[3][idx.size]); // updated
      expect(result.asks[3][idx.size]).toBe(3200); // updated
      expect(result.asks[4][idx.size]).toBe(old.asks[4][idx.size]);
    });

    it("removes an order when the received order update has size 0", () => {
      const current = makeOrderFeedData();
      expect(current.asks).toEqual([
        [61913.5, 4000, 4000],
        [61920.5, 2000, 6000],
        [61924.5, 1000, 7000],
        [61933.5, 3000, 10000],
        [61934.0, 5000, 15000],
      ]);

      const result = mapOrderFeedUpdates(
        current,
        makeOrderMessage({
          asks: [[61933.5, 0]],
        })
      );

      expect(result.asks).toHaveLength(current.asks.length - 1);
      expect(result.asks).toEqual([
        [61913.5, 4000, 4000],
        [61920.5, 2000, 6000],
        [61924.5, 1000, 7000],
        [61934.0, 5000, 12000],
      ]);
    });

    it("sorts the ask orders from lowest price to highest price", () => {
      const result = mapOrderFeedUpdates(
        makeOrderFeedData(),
        makeOrderMessage()
      );
      result.asks.forEach((ask, i) => {
        if (i > 0) {
          expect(ask[idx.price]).toBeGreaterThan(result.asks[i - 1][idx.price]);
        }
      })
    });

    it("sorts the bid orders from highest price to lowest price", () => {
      const result = mapOrderFeedUpdates(
        makeOrderFeedData(),
        makeOrderMessage()
      );
      result.bids.forEach((bid, i) => {
        if (i > 0) {
          expect(bid[idx.price]).toBeLessThan(result.bids[i - 1][idx.price]);
        }
      })
    });
  });
});

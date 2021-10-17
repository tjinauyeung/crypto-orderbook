import { useRef, useEffect, useState } from "react";
import "./App.css";

enum SocketState {
  connecting = 1,
  connected = 2,
  subscribed = 3,
  closed = 4,
}

type Price = number;
type Size = number;

type OrderMessage = [Price, Size];

type OrderMessages = OrderMessage[];

type OrderRecord = Record<Price, Order>;

type Order = {
  price: number;
  size: number;
  total: number;
};

type MaxTotals = {
  ask: number;
  bid: number;
};

function App() {
  const ws = useRef<WebSocket>(null);
  const [status, setStatus] = useState<SocketState>(SocketState.connecting);

  const [maxTotals, setMaxTotals] = useState<MaxTotals>({ ask: 0, bid: 0 });

  const [asks, setAsks] = useState<OrderRecord>({});
  const [bids, setBids] = useState<OrderRecord>({});

  useEffect(() => {
    ws.current = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
    ws.current.onopen = () => {
      setStatus(SocketState.connected);
    };
    ws.current.onclose = () => {
      setStatus(SocketState.closed);
    };

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (status === SocketState.connected) {
      subscribe(ws.current);
    }
  }, [status]);

  const subscribe = (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: ["PI_XBTUSD"],
      })
    );
  };

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.event === "subscribed") {
        return setStatus(SocketState.subscribed);
      }
      if (msg.feed === "book_ui_1_snapshot") {
        setAsks(normalize(msg.asks, true));
        setBids(normalize(msg.bids, false));
      }
      if (msg.feed === "book_ui_1") {
        if (msg.asks.length) {
          // setAsks((a) => update(a, msg.asks));
        }
        if (msg.bids.length) {
          // setBids((b) => update(b, msg.bids));
        }
      }
    };
  }, []);

  const normalize = (orders: OrderMessages, isAsk: boolean): OrderRecord => {
    let total = 0;
    const res = {};
    for (const [price, size] of orders) {
      res[price] = {
        price,
        size,
        total: (total += size),
      };
    }
    setMaxTotals((max) => ({
      ...max,
      [isAsk ? "ask" : "bid"]: total,
    }));
    return res;
  };

  const update = (current, delta: OrderMessages) => {
    for (const [price, size] of delta) {
      if (size === 0) {
        delete current[price];
      } else {
        current[price] = {
          price,
          size,
          total: current[price] ? current[price].total : size,
        };
      }
    }
    return { ...current };
  };

  return (
    <div className="layout">
      <div className="container">
        <div>
          <h2>Buy</h2>
          <table className="bids">
            <thead>
              <tr>
                <td>price</td>
                <td>size</td>
                <td>total</td>
              </tr>
            </thead>
            <tbody>
              {Object.values(bids as OrderRecord)
                .sort((a, b) => (a.price < b.price ? 1 : -1))
                .map((bid: Order) => (
                  <tr
                    key={bid.price}
                    style={{
                      backgroundImage: `linear-gradient(to left, green 0 ${Math.ceil(
                        (bid.total / maxTotals.bid) * 100
                      )}%, transparent ${Math.ceil(
                        (bid.total / maxTotals.bid) * 100
                      )}% 100%)`,
                    }}
                  >
                    <td>{bid.price}</td>
                    <td>{bid.size}</td>
                    <td>{bid.total}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Sell</h2>
          <table className="asks">
            <thead>
              <tr>
                <td>price</td>
                <td>size</td>
                <td>total</td>
              </tr>
            </thead>
            <tbody>
              {Object.values(asks as OrderRecord)
                .sort((a, b) => (a.price > b.price ? 1 : -1))
                .map((ask: Order) => (
                  <tr
                    key={ask.price}
                    style={{
                      backgroundImage: `linear-gradient(to right, red 0 ${Math.ceil(
                        (ask.total / maxTotals.ask) * 100
                      )}%, transparent ${Math.ceil(
                        (ask.total / maxTotals.ask) * 100
                      )}% 100%)`,
                    }}
                  >
                    <td>{ask.price}</td>
                    <td>{ask.size}</td>
                    <td>{ask.total}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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

export default App;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
    price: string;
    size: string;
    percentage?: number | string;
}

interface BestBid {
    price: string;
    size: string;
}

interface OrderBookState {
    bids: Record<string, string>;
    asks: Record<string, string>;
    bestBidCurrent: BestBid | null;
    bestAskCurrrent: BestBid | null;
    topBids: Order[];
    topAsks: Order[];
    aggregation: number;
    topN: number;
}

const initialState: OrderBookState = {
    bids: {},
    asks: {},
    bestBidCurrent: null,
    bestAskCurrrent: null,
    topBids: [],
    topAsks: [],
    aggregation: 0.01, // Default aggregation level
    topN: 10 // Default top N value
};

const aggregatePrice = (price: number, aggregation: number): number => {
    return Math.floor(price / aggregation) * aggregation;
};

const getTopOrdersWithPercentage = (orders: Record<string, string>, topN: number, isAscending: boolean, aggregation: number): Order[] => {
    let aggregatedOrders: Record<string, number> = {};

    // Aggregate orders based on the current aggregation level
    for (const [price, size] of Object.entries(orders)) {
        const aggregatedPrice = aggregatePrice(Number(price), aggregation).toFixed(2);
        if (aggregatedOrders[aggregatedPrice]) {
            aggregatedOrders[aggregatedPrice] += Number(size);
        } else {
            aggregatedOrders[aggregatedPrice] = Number(size);
        }
    }

    let topOrders = Object.entries(aggregatedOrders)
        .map(([price, size]) => ({ price, size: size.toString() }))
        .sort((a, b) => (isAscending ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price)))
        .slice(0, topN);

    const totalSize = topOrders.reduce((sum, order) => sum + Number(order.size), 0);

    return topOrders.map((order) => ({
        ...order,
        size: Number(order.size).toPrecision(8),
        percentage: totalSize > 0 ? ((Number(order.size) / totalSize) * 100).toFixed(2) : '0.00'
    }));
};

// Order matching logic
// if the order size is larger than what is made available by the top buyer or seller,
// the match needs to occur for the number of shares available and the matching algorithm needs to be called recursively for the remaining shares.
const matchOrder = (state: OrderBookState, side: string, price: string, size: string): string => {
    let remainingSize = Number(size);
    if (side === 'buy') {
        const sortedAsks = Object.keys(state.asks).sort((a, b) => Number(a) - Number(b));
        for (const askPrice of sortedAsks) {
            if (Number(price) >= Number(askPrice) && remainingSize > 0) {
                console.log('Buy match', 'price', price, 'askprice', askPrice, 'remainingSize', remainingSize);
                const askSize = Number(state.asks[askPrice]);
                if (askSize <= remainingSize) {
                    remainingSize -= askSize;
                    delete state.asks[askPrice];
                } else {
                    state.asks[askPrice] = (askSize - remainingSize).toString();
                    remainingSize = 0;
                }
            } else {
                break;
            }
        }
    } else if (side === 'sell') {
        const sortedBids = Object.keys(state.bids).sort((a, b) => Number(b) - Number(a));
        for (const bidPrice of sortedBids) {
            if (Number(price) <= Number(bidPrice) && remainingSize > 0) {
                console.log('Sell match', 'price', price, 'bidPrice', bidPrice, 'remainingSize', remainingSize);
                const bidSize = Number(state.bids[bidPrice]);
                if (bidSize <= remainingSize) {
                    remainingSize -= bidSize;
                    delete state.bids[bidPrice];
                } else {
                    state.bids[bidPrice] = (bidSize - remainingSize).toString();
                    remainingSize = 0;
                }
            } else {
                break;
            }
        }
    }
    return remainingSize.toString();
};

const orderBookSlice = createSlice({
    name: 'orderBook',
    initialState,
    reducers: {
        setOrderBookSnapshot(state, action: PayloadAction<{ bids: [string, string][]; asks: [string, string][] }>) {
            state.bids = Object.fromEntries(action.payload.bids);
            state.asks = Object.fromEntries(action.payload.asks);
            state.topBids = getTopOrdersWithPercentage(state.bids, state.topN, false, state.aggregation);
            state.topAsks = getTopOrdersWithPercentage(state.asks, state.topN, true, state.aggregation);
        },
        updateOrderBook(state, action: PayloadAction<[string, string, string][]>) {
            action.payload.forEach(([side, price, size]) => {
                const priceKey = price.toString();
                const remainingSize = matchOrder(state, side, price, size);

                if (Number(remainingSize) > 0) {
                    if (side === 'buy') {
                        state.bids[priceKey] = remainingSize;
                    } else if (side === 'sell') {
                        state.asks[priceKey] = remainingSize;
                    }
                }
            });
            state.topBids = getTopOrdersWithPercentage(state.bids, state.topN, false, state.aggregation);
            state.topAsks = getTopOrdersWithPercentage(state.asks, state.topN, true, state.aggregation);
        },

        setBestBidCurrent(state, action: PayloadAction<BestBid>) {
            state.bestBidCurrent = action.payload;
        },
        setBestAskCurrent(state, action: PayloadAction<BestBid>) {
            state.bestAskCurrrent = action.payload;
        },
        resetOrderBook() {
            return initialState;
        },

        setAggregation(state, action: PayloadAction<number>) {
            state.aggregation = action.payload;
            // Update top orders with new aggregation
            state.topBids = getTopOrdersWithPercentage(state.bids, state.topN, false, state.aggregation);
            state.topAsks = getTopOrdersWithPercentage(state.asks, state.topN, true, state.aggregation);
        },
        setTopN(state, action: PayloadAction<number>) {
            state.topN = action.payload;
            // Update top orders with new topN value
            state.topBids = getTopOrdersWithPercentage(state.bids, state.topN, false, state.aggregation);
            state.topAsks = getTopOrdersWithPercentage(state.asks, state.topN, true, state.aggregation);
        }
    }
});

export const { setOrderBookSnapshot, updateOrderBook, setBestBidCurrent, setBestAskCurrent, resetOrderBook, setAggregation, setTopN } =
    orderBookSlice.actions;

export default orderBookSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChartDataPoint {
    time: string;
    price: string;
    size: string;
}

interface ChartDataState {
    bestBidData: ChartDataPoint[];
    bestAskData: ChartDataPoint[];
}

const initialState: ChartDataState = {
    bestBidData: [],
    bestAskData: []
};

const chartDataSlice = createSlice({
    name: 'chartData',
    initialState,
    reducers: {
        addBestBid(state, action: PayloadAction<ChartDataPoint>) {
            state.bestBidData.push(action.payload);
            if (state.bestBidData.length > 100) {
                state.bestBidData = state.bestBidData.slice(-100);
            }
        },
        addBestAsk(state, action: PayloadAction<ChartDataPoint>) {
            state.bestAskData.push(action.payload);
            if (state.bestAskData.length > 100) {
                state.bestAskData = state.bestAskData.slice(-100);
            }
        },
        resetBestBids(state) {
            state.bestAskData = [];
            state.bestBidData = [];
        }
    }
});

export const { addBestBid, addBestAsk, resetBestBids } = chartDataSlice.actions;

export default chartDataSlice.reducer;

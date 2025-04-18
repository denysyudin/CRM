import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    currencyPair: 'BTC-USD' // Default currency pair
};

const currencyPairSlice = createSlice({
    name: 'currencyPair',
    initialState,
    reducers: {
        setSelectedPair: (state, action: PayloadAction<string>) => {
            state.currencyPair = action.payload;
        }
    }
});

export const { setSelectedPair } = currencyPairSlice.actions;
export default currencyPairSlice.reducer;

import { createSelector } from 'reselect';
import { RootState } from '../store';

const selectOrderBook = (state: RootState) => state.orderBook;

export const selectTopBids = createSelector(
    [selectOrderBook],
    (orderBook) => orderBook.topBids
);

export const selectTopAsks = createSelector(
    [selectOrderBook],
    (orderBook) => orderBook.topAsks
);

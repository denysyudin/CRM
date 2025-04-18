import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrderBook, setOrderBookSnapshot, setBestBidCurrent, setBestAskCurrent } from '../redux/features/orderBookSlice';
import { throttle } from '../utils/throttle';
import { addBestAsk, addBestBid } from '../redux/features/chartSlice';

interface UseWebSocketProps {
    url: string;
    currencyPair: string;
}

const useWebSocket = ({ url, currencyPair }: UseWebSocketProps) => {
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);
    const webSocket = useRef<WebSocket | null>(null);

    const handleWebSocketMessage = useCallback(
        (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                const currentTime = new Date().toISOString();

                if (data.type === 'snapshot') {
                    dispatch(setOrderBookSnapshot({ bids: data.bids, asks: data.asks }));
                }
                if (data.type === 'l2update') {
                    throttledUpdateOrderBook(data.changes);
                }

                if (data.type === 'ticker') {
                    dispatch(addBestAsk({ price: data.best_bid, size: data.best_bid_size, time: currentTime }));
                    dispatch(addBestBid({ price: data.best_ask, size: data.best_ask_size, time: currentTime }));
                    dispatch(setBestBidCurrent({ price: data.best_ask, size: data.best_ask_size }));
                    dispatch(setBestAskCurrent({ price: data.best_ask, size: data.best_ask_size }));
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        },
        [dispatch]
    );

    const throttledUpdateOrderBook = useCallback(
        throttle((changes: [string, string, string][]) => {
            dispatch(updateOrderBook(changes));
        }, 500),
        [dispatch]
    );

    useEffect(() => {
        webSocket.current = new WebSocket(url);

        webSocket.current.onopen = () => {
            setIsConnected(true);
            const subscribeMessage = {
                type: 'subscribe',
                product_ids: [currencyPair],
                channels: ['level2_batch', 'ticker']
            };
            if (webSocket.current?.readyState === WebSocket.OPEN) {
                webSocket.current.send(JSON.stringify(subscribeMessage));
            }
        };

        webSocket.current.onmessage = handleWebSocketMessage;

        webSocket.current.onclose = () => {
            setIsConnected(false);
        };

        webSocket.current.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        return () => {
            if (webSocket.current) {
                const unsubscribeMessage = {
                    type: 'unsubscribe',
                    product_ids: [currencyPair],
                    channels: ['level2_batch', 'ticker']
                };
                if (webSocket.current.readyState === WebSocket.OPEN) {
                    webSocket.current.send(JSON.stringify(unsubscribeMessage));
                }
                webSocket.current.close();
            }
        };
    }, [url, currencyPair, handleWebSocketMessage]);

    const sendMessage = useCallback((message: object) => {
        if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
            webSocket.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Ready state:', webSocket.current?.readyState);
        }
    }, []);

    return { isConnected, sendMessage };
};

export default useWebSocket;

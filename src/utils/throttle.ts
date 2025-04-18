export function throttle(func: (...args: any[]) => void, limit: number) {
    let inThrottle: boolean;
    return function (...args: any[]) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

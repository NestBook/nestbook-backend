import { AsyncLocalStorage } from "async_hooks";


export type LoggerContext = {
    requestId: string;
};

export const loggerContext = new AsyncLocalStorage<LoggerContext>()

export function getRequestId() {
    const store = loggerContext.getStore();
    return store?.requestId || 'unknown';
}



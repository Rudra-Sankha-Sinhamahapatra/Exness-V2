export type DBOperation = {
    type: 'CREATE_TRADE' | 'UPDATE_TRADE';
    data: any;
    responseChannel?: string;
}

export type CreateTradeData = {
    orderId: string;
    email: string;
    asset: string;
    openPrice: number;
    leverage: number;
    liquidated: boolean;
    assetId: string;
    userId: string;
}

export type UpdateTradeData = {
    orderId: string;
    closePrice: number;
    pnl: number;
    liquidated: boolean;
}
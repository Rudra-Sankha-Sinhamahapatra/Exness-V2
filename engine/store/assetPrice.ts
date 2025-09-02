

export interface AssetPrice {
    price: bigint,
    decimals: number;
}

export type Asset = 'SOL' | 'ETH' | 'BTC';
export const latestAssetPrices: Record<Asset, AssetPrice> = {
    'SOL':{
        price: BigInt(0),
        decimals: 4,
    },
    'ETH':{
        price: BigInt(0),
        decimals: 4,
    },
    'BTC': {
        price: BigInt(0),
        decimals: 4
    }
};
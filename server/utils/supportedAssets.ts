export type Assets = {
    symbol: string,
    name: string,
    imageUrl: string,
    decimals: number
}

export const SUPPORTED_ASSETS: Assets[] = [
    {
        symbol: "BTC",
        name: "Bitcoin",
        decimals: 4,
        imageUrl: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/1/bitcoin-bmg9hh1q4hk7jso7i2duzc.png/bitcoin-m01ryguriy9wrrdc8bby.png?_a=DATAg1AAZAA0"
    },
    {
        symbol: "ETH",
        name: "Ethereum", 
        decimals: 6,
        imageUrl: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/3/ethereum-64rgvv272gw7b9ba1fy8h5.png/ethereum-4lzs35cggcozag28efbl7.png?_a=DATAg1AAZAA0"
    },
    {
        symbol: "SOL",
        name: "Solana",
        decimals: 6,
        imageUrl: "https://images.seeklogo.com/logo-png/42/1/solana-sol-logo-png_seeklogo-423095.png"
    }
]
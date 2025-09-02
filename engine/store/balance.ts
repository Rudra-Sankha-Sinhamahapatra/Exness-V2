
interface assetBalance {
   balance: bigint,
   decimals: number,
}

export interface UserBalance {
 email: string
 usdc: assetBalance,
 btc: assetBalance,
 sol: assetBalance,
 eth: assetBalance
}

const userBalances = new Map<string,UserBalance>();

export function initializeBalance(email:string) {
    const defaultBalance : UserBalance = {
        email,
        usdc:{balance: BigInt(500000), decimals: 2},
        btc: {balance: BigInt(0), decimals: 4},
        eth: {balance: BigInt(0), decimals: 4},
        sol: {balance: BigInt(0), decimals: 4}
    }

    userBalances.set(email,defaultBalance);
    console.log("initialized balance for user ",email);
    return defaultBalance;
}

export function getUserBalance(email: string) {
    const balance = userBalances.get(email);
    if(!balance) {
        initializeBalance(email)
    }
    return balance;
}

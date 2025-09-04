
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

export const userBalances = new Map<string,UserBalance>();

export function initializeBalance(email:string) {
    const defaultBalance : UserBalance = {
        email,
        usdc:{balance: BigInt(500000), decimals: 2},
        btc: {balance: BigInt(0), decimals: 4},
        eth: {balance: BigInt(0), decimals: 6},
        sol: {balance: BigInt(0), decimals: 6}
    }

    userBalances.set(email,defaultBalance);
    console.log("initialized balance for user ",email);
    return defaultBalance;
}

export function getUserBalance(email: string) {
      const balance = userBalances.get(email);
    if(!balance) {
        const newBalance = initializeBalance(email);
        return newBalance;
    }
    return balance;
}

export function updateUserBalance(email: string, balance: UserBalance): UserBalance {
    userBalances.set(email, balance);
    console.log(`Updated balance for ${email}:`, {
        usdc: balance.usdc.balance.toString(),
        btc: balance.btc.balance.toString(),
        eth: balance.eth.balance.toString(),
        sol: balance.sol.balance.toString()
    });
    return balance;
}
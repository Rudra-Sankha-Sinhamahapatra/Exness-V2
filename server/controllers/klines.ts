/* 
https://api.backpack.exchange/api/v1/klines?symbol=ETH_USDC&interval=1h&startTime=1756751400&endTime=1756774800
*/

import axios from "axios";
import type { Request, Response } from "express";

export const getKlines = async (req: Request,res: Response) => {
  try {
    const asset = req.query.asset as string;
    if(!asset) {
        res.status(400).json({
            message:"No asset selected"
        })
        return;
    }

    if(asset !== 'SOL' && asset !== 'ETH' && asset !== 'BTC') {
        res.status(400).json({
            message: "Invalid asset selected"
        });
        return;
    }

    const interval = req.query.interval as string || '1h';
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - 24 * 60 * 60;
    const endTime = now;

    const backpackAPI = `https://api.backpack.exchange/api/v1/klines?symbol=${asset}_USDC&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
    const { data } = await axios.get(backpackAPI);

    res.status(200).json(data);
    return;
  } catch (error:any) {
    console.error("Failed to get klines: ",error.message);
    res.status(500).json({
        success: false,
        message: "failed to get klines"
    })
    return;
  }
}
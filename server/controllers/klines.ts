/* 
https://api.backpack.exchange/api/v1/klines?symbol=ETH_USDC&interval=1h&startTime=1756751400&endTime=1756774800
*/

import axios from "axios";

export const getKlines = async (req: Request): Promise<Response> => {
  try {
     const url = new URL(req.url);
    const asset = url.searchParams.get("asset");

     if (!asset) {
      return new Response(JSON.stringify({ message: "No asset selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
     }

    if (asset !== 'SOL' && asset !== 'ETH' && asset !== 'BTC') {
      return new Response(JSON.stringify({ message: "Invalid asset selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const interval = url.searchParams.get("interval") || '1h';
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - 24 * 60 * 60;
    const endTime = now;

    const backpackAPI = `https://api.backpack.exchange/api/v1/klines?symbol=${asset}_USDC&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
    const { data } = await axios.get(backpackAPI);

      return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Failed to get klines: ", error.message);
    return new Response(JSON.stringify({
      success: false,
      message: "failed to get klines"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
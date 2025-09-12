"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type ISeriesApi,
  type IChartApi,
  type UTCTimestamp,
  CandlestickSeries,
} from "lightweight-charts";
import { OHLCData } from "@/types/chartPage";

export default function TradingViewChart({ data }: { data: OHLCData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#262b33" },
        horzLines: { color: "#262b33" },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: { 
        timeVisible: true, 
        borderColor: "#3a4453",
        secondsVisible: false,
        minBarSpacing: 8, 
      },
      rightPriceScale: { borderColor: "#3a4453" },
    });

    const series = chart.addSeries(CandlestickSeries,{
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350", 
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      chartRef.current.resize(clientWidth, clientHeight);
    });
    ro.observe(containerRef.current);
    resizeObsRef.current = ro;

    const onWinResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      chartRef.current.resize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", onWinResize);

    return () => {
      window.removeEventListener("resize", onWinResize);
      resizeObsRef.current?.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      try {
        console.log("Processing candle data", data[0]);
        const formatted = data
          .map((candle) => {
            const time = convertToUTCTimestamp(candle.start || "");
            
            const open = typeof candle.open === 'string' ? parseFloat(candle.open) : candle.open;
            const high = typeof candle.high === 'string' ? parseFloat(candle.high) : candle.high;
            const low = typeof candle.low === 'string' ? parseFloat(candle.low) : candle.low;
            const close = typeof candle.close === 'string' ? parseFloat(candle.close) : candle.close;
            
            return {
              time,
              open,
              high,
              low,
              close,
            };
          })
          .sort((a, b) => (a.time as number) - (b.time as number))
          .filter((candle, index, array) => {
            if (index === 0) return true;
            return candle.time !== array[index - 1].time;
          });

        console.log("Formatted data:", formatted[0]);
        seriesRef.current.setData(formatted);
        chartRef.current?.timeScale().fitContent();
  
        if (formatted.length > 0) {
          const barsToShow = Math.min(60, formatted.length); 
          chartRef.current?.timeScale().setVisibleRange({
            from: formatted[formatted.length - barsToShow]?.time ?? formatted[0].time,
            to: formatted[formatted.length - 1].time,
          });
        }
      } catch (err) {
        console.error("Error processing candle data:", err);
      }
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] rounded-lg"
      style={{ background: "#000" }}
    />
  );
}

const convertToUTCTimestamp = (dateStr: string): UTCTimestamp => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateStr);
      return Math.floor(new Date().getTime() / 1000) as UTCTimestamp;
    }
    
    return Math.floor(date.getTime() / 1000) as UTCTimestamp;
  } catch (err) {
    console.error("Error converting timestamp:", err);
    return Math.floor(new Date().getTime() / 1000) as UTCTimestamp;
  }
};

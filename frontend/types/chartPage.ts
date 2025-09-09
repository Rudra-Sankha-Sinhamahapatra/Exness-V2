export interface OHLCData {
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  time: number | string;
  start?: string;
  end?: string;
  trades?: number;
  quoteVolume?: string;
}

export interface ApiResponse {
  success: boolean;
  data: OHLCData[];
}

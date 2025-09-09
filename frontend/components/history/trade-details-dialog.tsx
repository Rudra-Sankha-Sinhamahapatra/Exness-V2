'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Copy, X } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  orderId: string;
  asset: string;
  assetName?: string;
  assetImage?: string;
  openPrice: number;
  closePrice: number | null;
  leverage: number;
  tradeType: "long" | "short";
  margin?: number;
  pnl: number | null;
  status: "open" | "closed";
  liquidated: boolean;
  createdAt: string;
  closedAt?: string;
  duration: string;
  pnlPercentage: number | null;
  isProfitable?: boolean;
}

interface TradeDetailsDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeClose?: (trade: Trade) => void;
}

export function TradeDetailsDialog({ trade, open, onOpenChange, onTradeClose }: TradeDetailsDialogProps) {
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  
  if (!trade) return null;

  const handleClose = async () => {
    if (!trade || trade.status !== 'open') return;
    
    setIsClosing(true);
    try {
      const response = await apiService.trading.closePosition(trade.orderId);
      
      if (response.orderId) {
        toast({
          title: "Position closed",
          description: `${trade.asset} ${trade.tradeType} position closed successfully`,
        });
        
        if (onTradeClose) {
          onTradeClose(trade);
        }
        
        onOpenChange(false);
      } else {
        toast({
          title: "Failed to close position",
          description: "There was an error closing your position",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to close position:", error);
      toast({
        title: "Error closing position",
        description: "There was a problem communicating with the server",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(trade.orderId);
    toast({
      title: "Order ID copied",
      description: "Order ID copied to clipboard",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Trade Details</span>
              <Badge variant={trade.tradeType === "long" ? "default" : "destructive"}>
                {trade.tradeType === "long" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trade.tradeType.toUpperCase()}
              </Badge>
              {trade.liquidated && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  LIQUIDATED
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Asset</p>
            <p className="text-lg font-semibold">{trade.asset}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-lg font-semibold">{trade.status.toUpperCase()}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entry Price</p>
            <p className="text-lg font-semibold">${trade.openPrice.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Exit Price</p>
            <p className="text-lg font-semibold">
              {trade.closePrice ? `$${trade.closePrice.toLocaleString()}` : '—'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Leverage</p>
            <p className="text-lg font-semibold">{trade.leverage}×</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">P&L</p>
            {trade.pnl !== null ? (
              <p className={`text-lg font-semibold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString()} USD
                {trade.pnlPercentage !== null && (
                  <span className="text-sm ml-1">
                    ({trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-lg font-semibold">—</p>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entry Time</p>
            <p className="text-sm">{formatDate(trade.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Exit Time</p>
            <p className="text-sm">
              {trade.closedAt ? formatDate(trade.closedAt) : '—'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-sm">{trade.duration}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Order ID</p>
            <div className="flex items-center gap-1">
              <p className="text-xs font-mono truncate">{trade.orderId.substring(0, 8)}...</p>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={copyOrderId}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {trade.status === 'open' && (
          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              onClick={handleClose}
              disabled={isClosing}
            >
              {isClosing ? (
                <>
                  <span className="mr-2">Closing...</span>
                  <span className="animate-spin">⌛</span>
                </>
              ) : (
                'Close Position'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

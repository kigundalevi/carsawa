import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  carTitle: string;
  currentPrice: number;
  onSubmitBid: (amount: number) => void;
}

export function BidModal({ isOpen, onClose, carTitle, currentPrice, onSubmitBid }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(currentPrice);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (bidAmount <= currentPrice) {
      setError('Bid amount must be higher than the current price');
      return;
    }
    onSubmitBid(bidAmount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
        <p className="text-gray-600 mb-6">{carTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price: KSh {currentPrice.toLocaleString()}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                KSh
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(Number(e.target.value));
                  setError('');
                }}
                className={cn(
                  "w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  error ? "border-red-500" : "border-gray-300"
                )}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Bidding Rules</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum increment: KSh 50,000</li>
              <li>• Bid is binding once placed</li>
              <li>• Winner must complete purchase within 48 hours</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-black font-medium py-2 rounded-lg transition-colors"
          >
            Place Bid
          </button>
        </form>
      </div>
    </div>
  );
}
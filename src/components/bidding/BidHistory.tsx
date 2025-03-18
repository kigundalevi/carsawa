import { Clock } from 'lucide-react';

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  time: string;
}

interface BidHistoryProps {
  bids: Bid[];
}

export function BidHistory({ bids }: BidHistoryProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Bid History</h3>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div
            key={bid.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium">KSh {bid.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{bid.bidder}</p>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {bid.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
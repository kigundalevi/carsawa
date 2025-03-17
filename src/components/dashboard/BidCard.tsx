import React from 'react';
import { Clock } from 'lucide-react';

interface Bid {
  id: string;
  carName: string;
  amount: number;
  timeLeft: string;
  image: string;
}

interface BidCardProps {
  title: string;
  bids: Bid[];
}

export function BidCard({ title, bids }: BidCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div key={bid.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <img
              src={bid.image}
              alt={bid.carName}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium">{bid.carName}</h4>
              <p className="text-primary font-semibold">KSh {bid.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {bid.timeLeft}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
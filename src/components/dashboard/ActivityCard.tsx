import React from 'react';
import { cn } from '../../lib/utils';
interface Activity {
  id: string;
  message: string;
  time: string;
  type: 'bid' | 'sale' | 'listing';
}

interface ActivityCardProps {
  activities: Activity[];
}

export function ActivityCard({ activities }: ActivityCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <div className={cn(
              "w-2 h-2 rounded-full",
              {
                'bg-primary': activity.type === 'bid',
                'bg-green-500': activity.type === 'sale',
                'bg-blue-500': activity.type === 'listing'
              }
            )} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">{activity.message}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
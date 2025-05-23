import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { Loader } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  isLoading = false
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="flex items-center mt-2 h-8">
              <Loader className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          )}
          {!isLoading && trend && (
            <p className={cn(
              "text-sm mt-2 flex items-center",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <Icon className="w-6 h-6 text-secondary" />
        </div>
      </div>
    </div>
  );
}
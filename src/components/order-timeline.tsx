"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, CookingPot, Bike, Home } from 'lucide-react';
import type { OrderStatus } from '@/lib/types';

const statuses: { name: OrderStatus; icon: React.ElementType }[] = [
  { name: 'Placed', icon: CheckCircle },
  { name: 'Preparing', icon: CookingPot },
  { name: 'Out for Delivery', icon: Bike },
  { name: 'Delivered', icon: Home },
];

interface OrderTimelineProps {
    initialStatus: OrderStatus;
    orderDate?: string;
}

export default function OrderTimeline({ initialStatus, orderDate }: OrderTimelineProps & { orderDate?: string }) {
  const findStatusIndex = (status: OrderStatus) => statuses.findIndex(s => s.name === status);
  // If orderDate is provided, check if it's older than 5 minutes
  let statusIndex = findStatusIndex(initialStatus);
  if (orderDate) {
    const orderTime = new Date(orderDate).getTime();
    const now = Date.now();
    if (now - orderTime > 5 * 60 * 1000) {
      statusIndex = statuses.length - 1; // Delivered
    } else if (now - orderTime > 2 * 60 * 1000) {
      statusIndex = 2; // Out for Delivery
    } else if (now - orderTime > 1 * 60 * 1000) {
      statusIndex = 1; // Preparing
    } else {
      statusIndex = 0; // Placed
    }
  }
  const [currentStatusIndex, setCurrentStatusIndex] = useState(statusIndex);

  useEffect(() => {}, []); // No auto-progress for old orders

  const progressPercentage = (currentStatusIndex / (statuses.length - 1)) * 100;

  return (
    <div className="w-full px-4 pt-4">
        <div className="relative h-2 bg-muted rounded-full">
            <div
                className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute -top-3.5 -left-1 flex w-full justify-between">
                 {statuses.map((status, index) => (
                    <div key={status.name} className="flex flex-col items-center">
                         <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500",
                                index <= currentStatusIndex ? 'bg-primary border-primary-foreground text-primary-foreground' : 'bg-muted border-border text-muted-foreground'
                            )}
                        >
                            <status.icon className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex justify-between mt-8 text-xs text-center">
             {statuses.map((status, index) => (
                 <div key={status.name} className={cn("w-1/4 font-medium", index <= currentStatusIndex ? 'text-primary' : 'text-muted-foreground')}>
                    {status.name}
                 </div>
             ))}
        </div>
    </div>
  );
}

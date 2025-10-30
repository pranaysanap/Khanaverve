'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import OrderTimeline from '@/components/order-timeline';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React from 'react';

export default function OrdersPage() {
    const { orders } = useUserStore();
    const router = useRouter();
    const [openDialogId, setOpenDialogId] = React.useState<string | null>(null);
    
    const currentTime = new Date().getTime();
    const activeOrders = orders.filter(o => {
        const orderTime = new Date(o.orderDate).getTime();
        const timeDifference = currentTime - orderTime;
        // Only orders within last 5 minutes are active
        if (timeDifference > 5 * 60 * 1000) {
            o.status = 'Delivered';
            return false;
        }
        return true;
    });
    const pastOrders = orders.filter(o => o.status === 'Delivered');

    const handleViewOrder = (orderId: string) => {
        router.push(`/orders/${orderId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Your Orders</h1>

            {orders.length === 0 ? (
                 <div className="text-center py-16">
                    <ScrollText className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold">No orders yet</h2>
                    <p className="mt-2 text-muted-foreground">
                        Looks like you haven't placed any orders yet.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/explore">Start Ordering</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeOrders.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Active Orders</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeOrders.map(order => (
                                    <Card key={order.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>Order #{order.id.split('-')[1]}</span>
                                                <span className="text-sm font-normal bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                    {order.status}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                {format(new Date(order.orderDate), 'MMM d, yyyy h:mm a')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                                                <span className="text-sm text-muted-foreground">{order.items.length} items</span>
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                {order.vendorName}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <OrderTimeline initialStatus={order.status} orderDate={order.orderDate} />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {pastOrders.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Past Orders</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pastOrders.map(order => (
                                    <Card key={order.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>Order #{order.id.split('-')[1]}</span>
                                                <span className={`text-sm font-normal px-2 py-1 rounded ${
                                                    order.status === 'Delivered' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                {format(new Date(order.orderDate), 'MMM d, yyyy h:mm a')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                                                <span className="text-sm text-muted-foreground">{order.items.length} items</span>
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                {order.vendorName}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/orders/${order.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <Link href="/explore">
                                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                                    Order Again
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
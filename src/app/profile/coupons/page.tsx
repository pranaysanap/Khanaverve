'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

export default function CouponsPage() {
    const { coupons } = useUserStore();
    const { toast } = useToast();
    const [copiedCoupons, setCopiedCoupons] = useState<Set<string>>(new Set());

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCoupons(prev => new Set(prev).add(id));
        toast({ title: 'Copied', description: `Coupon code ${code} copied to clipboard.` });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
            setCopiedCoupons(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 2000);
    };

    const activeCoupons = coupons.filter(coupon => !coupon.isUsed && new Date(coupon.expiry) > new Date());
    const usedCoupons = coupons.filter(coupon => coupon.isUsed);
    const expiredCoupons = coupons.filter(coupon => !coupon.isUsed && new Date(coupon.expiry) <= new Date());

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <Tag className="h-6 w-6" />
                <h1 className="text-2xl font-bold">My Coupons</h1>
            </div>

            {coupons.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No coupons available</h3>
                        <p className="mt-2 text-muted-foreground">Check back later for new coupons and offers.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {activeCoupons.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Active Coupons</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeCoupons.map((coupon) => (
                                    <Card key={coupon.id} className="border-primary">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                                                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                                    <p className="mt-1 font-medium">
                                                        {coupon.type === 'percent' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}
                                                        {coupon.minOrder > 0 && ` on orders above ₹${coupon.minOrder}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Expires on {format(parseISO(coupon.expiry), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleCopyCode(coupon.code, coupon.id)}
                                                >
                                                    {copiedCoupons.has(coupon.id) ? (
                                                        <>
                                                            <Check className="h-4 w-4 mr-1" /> Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4 mr-1" /> Copy
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {usedCoupons.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Used Coupons</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {usedCoupons.map((coupon) => (
                                    <Card key={coupon.id} className="opacity-70">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                                                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                                    <p className="mt-1 font-medium">
                                                        {coupon.type === 'percent' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">Used</p>
                                                </div>
                                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">Used</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {expiredCoupons.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Expired Coupons</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {expiredCoupons.map((coupon) => (
                                    <Card key={coupon.id} className="opacity-70">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                                                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                                    <p className="mt-1 font-medium">
                                                        {coupon.type === 'percent' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Expired on {format(parseISO(coupon.expiry), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">Expired</span>
                                            </div>
                                        </CardContent>
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
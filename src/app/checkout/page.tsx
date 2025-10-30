// This is a simplified version of the checkout page.
// In a real app, this would involve complex forms and payment integrations.
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/use-cart-store';
import { useUserStore } from '@/stores/use-user-store';
import { MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScratchCard } from '@/components/scratch-card';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const { profile, prime, addOrder, coupons, useCoupon, setProfile } = useUserStore();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedCouponId, setSelectedCouponId] = useState<string>('');
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
      profile.addresses.find(a => a.isDefault)?.id || profile.addresses[0]?.id || ''
    );

    const deliveryFee = 49; // fixed fee as requested
    const subtotal = totalPrice();
    const taxes = subtotal * 0.05;

    const availableCoupons = useMemo(() => {
        const now = Date.now();
        return coupons.filter(c => !c.isUsed && new Date(c.expiry).getTime() > now && c.type === 'percent' && c.discount >= 5 && c.discount <= 20);
    }, [coupons]);

    const selectedCoupon = useMemo(() => availableCoupons.find(c => c.id === selectedCouponId), [availableCoupons, selectedCouponId]);
    const preDiscountTotal = subtotal + deliveryFee + taxes;
    const couponDiscount = selectedCoupon && subtotal >= selectedCoupon.minOrder ? (preDiscountTotal * (selectedCoupon.discount / 100)) : 0;
    const finalTotal = preDiscountTotal - couponDiscount - (prime.isActive ? subtotal * 0.1 : 0);

    const handlePlaceOrder = () => {
        const params = new URLSearchParams();
        if (selectedCouponId) params.set('couponId', selectedCouponId);
        router.push(`/payment?${params.toString()}`);
    }
    
    const paymentHref = selectedCouponId ? `/payment?couponId=${selectedCouponId}` : '/payment';

    const handleAddressChange = () => {
        // Update the default address in the profile
        const updatedAddresses = profile.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === selectedAddressId
        }));
        
        setProfile({
            ...profile,
            addresses: updatedAddresses
        });
        
        setIsAddressDialogOpen(false);
        toast({ title: 'Success', description: 'Delivery address updated successfully.' });
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="mt-6 text-2xl font-semibold">Your cart is empty!</h2>
                <Button asChild className="mt-6"><Link href="/explore">Go Shopping</Link></Button>
            </div>
        )
    }

    const selectedAddress = profile.addresses.find(addr => addr.id === selectedAddressId);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><MapPin/> Delivery Address</CardTitle>
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">Change</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Select Delivery Address</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        {profile.addresses.length > 0 ? (
                                            <>
                                                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                                    {profile.addresses.map((address) => (
                                                        <div key={address.id} className="flex items-center space-x-2 p-3 border rounded-lg mb-2">
                                                            <RadioGroupItem value={address.id} id={address.id} />
                                                            <Label htmlFor={address.id} className="flex-grow cursor-pointer">
                                                                <p className="font-medium">{profile.name}</p>
                                                                <p className="text-sm text-muted-foreground">{address.fullAddress}</p>
                                                                {address.isDefault && (
                                                                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleAddressChange}>Save Address</Button>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-4">No addresses found. Please add an address in your profile.</p>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{profile.name}</p>
                            <p className="text-muted-foreground">{selectedAddress?.fullAddress}</p>
                        </CardContent>
                    </Card>

                    

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Tag/> Coupons & Offers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Select a coupon to apply discount on subtotal.</p>
                            <div className="flex gap-2 items-center">
                                <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                                    <SelectTrigger className="w-[260px]">
                                        <SelectValue placeholder="Choose coupon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCoupons.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.code} - {c.discount}% off (min ₹{c.minOrder})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCoupon && subtotal < selectedCoupon.minOrder && (
                                    <span className="text-xs text-muted-foreground">Add ₹{(selectedCoupon.minOrder - subtotal).toFixed(0)} more to use this coupon</span>
                                )}
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Or scratch to unlock a special coupon:</p>
                                <ScratchCard />
                            </div>
                        </CardContent>
                    </Card>

                </div>
                <div className="md:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader><CardTitle>Price Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Taxes</span><span>₹{taxes.toFixed(2)}</span></div>
                            {prime.isActive && <div className="flex justify-between text-green-600"><span>Prime Discount</span><span>-₹{(subtotal * 0.1).toFixed(2)}</span></div>}
                            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount ({selectedCoupon?.code})</span><span>-₹{couponDiscount.toFixed(2)}</span></div>}
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-base"><span>To Pay</span><span>₹{finalTotal.toFixed(2)}</span></div>
                            <Button className="w-full mt-4" size="lg" asChild>
                                <Link href={paymentHref}>Proceed</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Wallet } from 'lucide-react';
import { useCartStore } from '@/stores/use-cart-store';
import { useUserStore } from '@/stores/use-user-store';
import { useToast } from '@/hooks/use-toast';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { profile, prime, wallet, updateWalletBalance, addOrder, coupons, useCoupon } = useUserStore();
  const { toast } = useToast();

  const couponId = searchParams.get('couponId') || '';

  const deliveryFee = 49;
  const subtotal = totalPrice();
  const taxes = subtotal * 0.05;

  const selectedCoupon = useMemo(() => coupons.find(c => c.id === couponId), [coupons, couponId]);
  const preDiscountTotal = subtotal + deliveryFee + taxes;
  const couponDiscount = selectedCoupon && !selectedCoupon.isUsed && new Date(selectedCoupon.expiry).getTime() > Date.now() && subtotal >= selectedCoupon.minOrder
    ? (preDiscountTotal * (selectedCoupon.discount / 100))
    : 0;
  const primeDiscount = prime.isActive ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, preDiscountTotal - primeDiscount - couponDiscount);

  const [activeTab, setActiveTab] = useState<'upi' | 'qr'>('upi');
  const [upiId, setUpiId] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [upiVerificationStep, setUpiVerificationStep] = useState<'verifying' | 'verified' | 'payment'>('verifying');
  const [useWallet, setUseWallet] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [upiVerified, setUpiVerified] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const effectiveWalletDeduction = useWallet ? Math.min(wallet.balance, finalTotal) : 0;
  const toPayAfterWallet = finalTotal - effectiveWalletDeduction;
  const previewWalletBalance = wallet.balance - effectiveWalletDeduction;

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentDialogOpen && upiVerificationStep === 'payment' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Timer expired
      setPaymentDialogOpen(false);
      toast({ title: 'Payment Timeout', description: 'Payment session expired. Please try again.' });
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [paymentDialogOpen, upiVerificationStep, countdown]);

  // QR code display effect
  useEffect(() => {
    let qrTimer: NodeJS.Timeout;
    let popupTimer: NodeJS.Timeout;
    
    if (activeTab === 'qr') {
      // Show QR code after 5 seconds
      qrTimer = setTimeout(() => {
        setShowQrCode(true);
      }, 5000);
      
      // Show popup after 10 seconds (5 seconds for QR + 5 more seconds)
      popupTimer = setTimeout(() => {
        setPaymentDialogOpen(true);
        setCountdown(300); // Reset countdown to 5 minutes
        setUpiVerificationStep('payment');
        
        // After 10 seconds, simulate successful payment
        setTimeout(() => {
          setPaymentDialogOpen(false);
          completeOrder();
        }, 10000);
      }, 10000);
    }
    
    return () => {
      if (qrTimer) clearTimeout(qrTimer);
      if (popupTimer) clearTimeout(popupTimer);
    };
  }, [activeTab]);

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      router.push('/explore');
      return;
    }

    // If UPI tab is active and UPI ID is entered
    if (activeTab === 'upi' && upiId) {
      if (upiVerified) {
        // UPI is verified, proceed to payment with 5-minute timer
        setPaymentDialogOpen(true);
        setCountdown(300); // Reset countdown to 5 minutes
        setUpiVerificationStep('payment');
        
        // After 10 seconds, simulate successful payment
        setTimeout(() => {
          setPaymentDialogOpen(false);
          completeOrder();
        }, 10000);
      } else {
        toast({ title: 'Verify UPI First', description: 'Please verify your UPI ID by clicking "Pay via UPI" first.' });
      }
      return;
    }

    // For QR tab, initiate payment flow
    if (activeTab === 'qr') {
      setPaymentDialogOpen(true);
      setCountdown(300); // Reset countdown to 5 minutes
      setUpiVerificationStep('payment');
      
      // After 10 seconds, simulate successful payment
      setTimeout(() => {
        setPaymentDialogOpen(false);
        completeOrder();
      }, 10000);
      return;
    }

    // For other cases (no UPI ID), proceed with normal order placement
    if (activeTab === 'upi' && !upiId) {
      toast({ title: 'Enter UPI ID', description: 'Please provide a valid UPI ID.' });
      return;
    }

    // Simulate payment success for other payment methods
    completeOrder();
  };

  const completeOrder = () => {
    // Simulate payment success
    if (useWallet && effectiveWalletDeduction > 0) {
      updateWalletBalance(effectiveWalletDeduction, 'debit', 'Order payment');
    }

    const newOrder = {
      id: `KHV-${Date.now()}`,
      items: items,
      total: finalTotal,
      status: 'Placed' as const,
      orderDate: new Date().toISOString(),
      deliveryAddress: profile.addresses.find(a => a.isDefault)?.fullAddress || 'N/A',
      vendorName: 'Various',
    };

    addOrder(newOrder);
    if (selectedCoupon) useCoupon(selectedCoupon.id);
    clearCart();
    toast({ title: 'Payment successful', description: 'Your order has been placed!' });
    router.push('/orders');
  };

  const handlePayViaUpi = () => {
    if (!upiId) {
      toast({ title: 'Enter UPI ID', description: 'Please provide a valid UPI ID.' });
      return;
    }
    
    setPaymentDialogOpen(true);
    setUpiVerificationStep('verifying');
    
    // Simulate UPI verification
    setTimeout(() => {
      setUpiVerificationStep('verified');
      setUpiVerified(true);
      
      // Close dialog after verification
      setTimeout(() => {
        setPaymentDialogOpen(false);
        toast({ title: 'UPI Verified', description: 'Your UPI ID has been verified successfully.' });
      }, 1500);
    }, 2000);
  };

  // Simple QR code generator function (for demo purposes)
  const generateQrCode = () => {
    return (
      <div className="relative w-48 h-48 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
        <div className="grid grid-cols-4 gap-1">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} border border-gray-200`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-1 rounded">
            <QrCode className="h-8 w-8 text-black" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Payment</h1>
          <p className="text-sm text-muted-foreground">Choose your preferred payment method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Wallet Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Wallet</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Current Balance</p>
                  <p className="text-2xl font-bold">₹{previewWalletBalance.toFixed(2)}</p>
                </div>
                <Button 
                  variant={useWallet ? 'default' : 'outline'} 
                  onClick={() => setUseWallet(v => !v)}
                >
                  {useWallet ? 'Wallet Selected' : 'Use Wallet'}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> UPI
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> QR
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upi" className="mt-4">
                    <div className="max-w-sm">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="yourname@bank" 
                          value={upiId} 
                          onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }} 
                        />
                        <Button onClick={handlePayViaUpi}>
                          Pay via UPI
                        </Button>
                      </div>
                      {upiVerified && (
                        <p className="text-green-500 text-sm mt-2 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          UPI ID verified
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="qr" className="mt-4">
                    <div className="flex flex-col items-center gap-4">
                      {!showQrCode ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
                          <p className="text-muted-foreground">Generating QR code...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          {generateQrCode()}
                          <p className="text-muted-foreground text-center mt-2">Scan this QR code with your UPI app</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>

          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                {primeDiscount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Prime Discount</span>
                    <span>-₹{primeDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Coupon</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {useWallet && effectiveWalletDeduction > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Wallet</span>
                    <span>-₹{effectiveWalletDeduction.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>To Pay</span>
                  <span className="text-primary">₹{toPayAfterWallet.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-4" size="lg" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* UPI payment processing dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {upiVerificationStep === 'verifying' && 'Verifying UPI ID'}
              {upiVerificationStep === 'verified' && 'UPI ID Verified'}
              {upiVerificationStep === 'payment' && 'Complete Payment in UPI App'}
            </DialogTitle>
          </DialogHeader>
          
          {upiVerificationStep === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
              <p className="text-muted-foreground">Verifying your UPI ID...</p>
            </div>
          )}
          
          {upiVerificationStep === 'verified' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="inline-block h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              <p className="text-muted-foreground">UPI ID verified successfully!</p>
            </div>
          )}
          
          {upiVerificationStep === 'payment' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                <p className="text-muted-foreground">Payment in progress...</p>
              </div>
              <p className="text-muted-foreground text-sm text-center">Please complete the payment in your UPI app</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary font-mono text-lg">{formatTime(countdown)}</span>
                <span className="text-muted-foreground text-sm">remaining</span>
              </div>
              <p className="text-muted-foreground mt-4">Payment will be confirmed automatically</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
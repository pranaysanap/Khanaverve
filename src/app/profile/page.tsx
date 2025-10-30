'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Edit, Wallet, Star, MapPin, Heart, Tag, LogOut, ChevronRight, QrCode } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
    // All hooks must be declared at the top level, before any conditional logic
    const { profile, wallet, prime, updateWalletBalance, purchasePrime } = useUserStore();
    const { toast } = useToast();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isPrimeDialogOpen, setIsPrimeDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'wallet' | 'upi' | 'qr'>('wallet');
    const [upiId, setUpiId] = useState('');
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [upiVerificationStep, setUpiVerificationStep] = useState<'verifying' | 'verified' | 'payment'>('verifying');
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
    const [upiVerified, setUpiVerified] = useState(false);
    const [showQrCode, setShowQrCode] = useState(false);

    const avatarImage = findImage('profile-avatar', placeholderImages);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };
    
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
                
                // After 10 seconds, simulate successful payment
                setTimeout(() => {
                    setPaymentDialogOpen(false);
                    handleSuccessfulTopUp();
                }, 10000);
            }, 10000);
        }
        
        return () => {
            if (qrTimer) clearTimeout(qrTimer);
            if (popupTimer) clearTimeout(popupTimer);
        };
    }, [activeTab]);

    const menuItems = [
        { icon: MapPin, label: 'Manage Addresses', href: '/profile/addresses' },
        { icon: Heart, label: 'Favorites', href: '/profile/favorites' },
        { icon: Tag, label: 'My Coupons', href: '/profile/coupons' },
        { icon: Wallet, label: 'My Orders', href: '/orders' },
        { icon: LogOut, label: 'Logout', href: '#' },
    ];

    const handleAddMoney = () => {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.' });
            return;
        }

        // For wallet top-up, we'll directly add the money without payment flow
        updateWalletBalance(amountValue, 'credit', 'Wallet top-up');
        setAmount('');
        setIsOpen(false);
        toast({ title: 'Success', description: `₹${amountValue.toFixed(2)} added to your wallet.` });
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

    const handlePlaceOrder = () => {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.' });
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
                    handleSuccessfulTopUp();
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
            
            // After 10 seconds, simulate successful payment
            setTimeout(() => {
                setPaymentDialogOpen(false);
                handleSuccessfulTopUp();
            }, 10000);
            return;
        }

        // For other cases (no UPI ID), proceed with direct wallet top-up
        if (activeTab === 'upi' && !upiId) {
            toast({ title: 'Enter UPI ID', description: 'Please provide a valid UPI ID.' });
            return;
        }
    };

    const handleSuccessfulTopUp = () => {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast({ title: 'Error', description: 'Invalid amount.' });
            return;
        }

        // Add money to wallet
        updateWalletBalance(amountValue, 'credit', 'Wallet top-up via UPI/QR');
        setAmount('');
        setIsOpen(false);
        toast({ title: 'Success', description: `₹${amountValue.toFixed(2)} added to your wallet.` });
    };

    // Simple QR code generator function (for demo purposes)
    const generateQrCode = () => {
        return (
            <div className="relative w-48 h-48 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
                <Image
                    src="/images/qr-code-payment.png"
                    alt="Payment QR Code"
                    width={192}
                    height={192}
                    className="rounded-lg"
                />
            </div>
        );
    };

    const handlePurchasePrime = () => {
        const result = purchasePrime();
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ title: 'Error', description: result.message });
        }
        setIsPrimeDialogOpen(false);
    };

    const handleEditProfile = () => {
        router.push('/profile/edit');
    };

    const handleMenuItemClick = (href: string, label: string) => {
        if (href === '#') {
            // Handle logout
            toast({ title: 'Logout', description: 'You have been logged out successfully.' });
            // In a real app, you would clear user session here
            // For now, we'll just show a toast
            return;
        }
        
        // Navigate to the respective page
        router.push(href);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center mb-8">
                <Avatar className="h-24 w-24 border-4 border-primary">
                    {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                    ) : (
                        <AvatarImage src={avatarImage.imageUrl} alt={profile.name} data-ai-hint={avatarImage.imageHint}/>
                    )}
                    <AvatarFallback className="text-3xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mt-4">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                {profile.bio && <p className="text-muted-foreground mt-2 text-center">{profile.bio}</p>}
                <Button variant="outline" size="sm" className="mt-4" onClick={handleEditProfile}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="bg-gradient-to-br from-primary to-orange-500 text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star/> Prime Membership</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {prime.isActive ? (
                            <>
                                <p className="text-2xl font-bold">Active</p>
                                <p className="text-sm opacity-80">Expires on {format(parseISO(prime.expiryDate!), 'PPP')}</p>
                            </>
                        ) : (
                             <>
                                <p className="text-2xl font-bold">Inactive</p>
                                <p className="text-sm opacity-80">₹99 for 30 days</p>
                             </>
                        )}
                        <Dialog open={isPrimeDialogOpen} onOpenChange={setIsPrimeDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="mt-4">
                                    {prime.isActive ? 'Manage' : 'Join Prime'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{prime.isActive ? 'Manage Prime Membership' : 'Purchase Prime Membership'}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg">Prime Membership Benefits</h3>
                                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                                <li>10% discount on all orders</li>
                                                <li>Free delivery on all orders</li>
                                                <li>Exclusive coupons and offers</li>
                                                <li>Priority customer support</li>
                                            </ul>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Cost:</span>
                                            <span className="font-bold">₹99</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Your Wallet Balance:</span>
                                            <span className="font-bold">₹{wallet.balance.toFixed(2)}</span>
                                        </div>
                                        {wallet.balance < 99 ? (
                                            <p className="text-red-500 text-sm">Insufficient balance. Please add money to your wallet.</p>
                                        ) : (
                                            <p className="text-green-500 text-sm">Sufficient balance available.</p>
                                        )}
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsPrimeDialogOpen(false)}>Cancel</Button>
                                            {prime.isActive ? (
                                                <Button disabled>Already Active</Button>
                                            ) : (
                                                <Button 
                                                    onClick={handlePurchasePrime} 
                                                    disabled={wallet.balance < 99}
                                                >
                                                    Purchase with Wallet
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wallet/> Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{wallet.balance.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="mt-4">Add Money</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Money to Wallet</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Amount (₹)</label>
                                            <Input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        
                                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                                                <TabsTrigger value="upi" className="flex items-center gap-2">
                                                    <QrCode className="h-4 w-4" /> UPI
                                                </TabsTrigger>
                                                <TabsTrigger value="qr" className="flex items-center gap-2">
                                                    <QrCode className="h-4 w-4" /> QR
                                                </TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="wallet" className="mt-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleAddMoney}>Add Money</Button>
                                                </div>
                                            </TabsContent>
                                            
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
                                                    <div className="flex justify-end gap-2 mt-4">
                                                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                                        <Button onClick={handlePlaceOrder} disabled={!upiVerified}>
                                                            Add Money
                                                        </Button>
                                                    </div>
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
                                                    <div className="flex justify-end gap-2 w-full mt-4">
                                                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                                        <Button onClick={handlePlaceOrder}>
                                                            Add Money
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="mt-8">
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {menuItems.map(item => (
                            <li 
                                key={item.label} 
                                className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleMenuItemClick(item.href, item.label)}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
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
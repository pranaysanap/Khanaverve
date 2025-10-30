'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AddressesPage() {
    const { profile, setProfile } = useUserStore();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState('');

    const handleAddAddress = () => {
        if (!newAddress.trim()) {
            toast({ title: 'Error', description: 'Please enter a valid address.' });
            return;
        }

        const updatedProfile = {
            ...profile,
            addresses: [
                ...profile.addresses,
                {
                    id: `addr${Date.now()}`,
                    fullAddress: newAddress,
                    isDefault: profile.addresses.length === 0
                }
            ]
        };

        setProfile(updatedProfile);
        setNewAddress('');
        setIsAdding(false);
        toast({ title: 'Success', description: 'Address added successfully.' });
    };

    const handleDeleteAddress = (id: string) => {
        if (profile.addresses.length <= 1) {
            toast({ title: 'Error', description: 'You must have at least one address.' });
            return;
        }

        const updatedAddresses = profile.addresses.filter(addr => addr.id !== id);
        const updatedProfile = { ...profile, addresses: updatedAddresses };
        
        // If we deleted the default address, set the first one as default
        if (profile.addresses.find(addr => addr.id === id)?.isDefault) {
            if (updatedAddresses.length > 0) {
                updatedAddresses[0].isDefault = true;
            }
        }

        setProfile(updatedProfile);
        toast({ title: 'Success', description: 'Address deleted successfully.' });
    };

    const handleSetDefault = (id: string) => {
        const updatedAddresses = profile.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }));

        const updatedProfile = { ...profile, addresses: updatedAddresses };
        setProfile(updatedProfile);
        toast({ title: 'Success', description: 'Default address updated.' });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Manage Addresses</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                    {profile.addresses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No addresses added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {profile.addresses.map((address) => (
                                <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{address.fullAddress}</p>
                                        {address.isDefault && (
                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!address.isDefault && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            onClick={() => handleDeleteAddress(address.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAdding ? (
                        <div className="mt-6 p-4 border rounded-lg">
                            <Label htmlFor="address" className="block mb-2">New Address</Label>
                            <Input
                                id="address"
                                placeholder="Enter your full address"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                className="mb-4"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={handleAddAddress}>Add Address</Button>
                            </div>
                        </div>
                    ) : (
                        <Button className="mt-6" onClick={() => setIsAdding(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
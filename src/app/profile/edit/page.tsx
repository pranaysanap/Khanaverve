'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Camera } from 'lucide-react';

export default function EditProfilePage() {
    const { profile, setProfile } = useUserStore();
    const { toast } = useToast();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const avatarImage = findImage('profile-avatar', placeholderImages);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    useEffect(() => {
        // Initialize form with current profile data
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setBio(profile.bio || '');
        // Set initial avatar preview
        setAvatarPreview(profile.avatar || null);
    }, [profile]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Error', description: 'Image size should be less than 5MB.', variant: 'destructive' });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!name.trim()) {
            toast({ title: 'Error', description: 'Name is required.', variant: 'destructive' });
            return;
        }
        
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            toast({ title: 'Error', description: 'Please enter a valid email address.', variant: 'destructive' });
            return;
        }
        
        if (!phone.trim() || !/^\d{10}$/.test(phone)) {
            toast({ title: 'Error', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
            return;
        }
        
        // Update profile with avatar if changed
        setProfile({
            ...profile,
            name,
            email,
            phone,
            bio: bio.trim() || undefined,
            avatar: avatarPreview || profile.avatar
        });
        
        toast({ title: 'Success', description: 'Profile updated successfully.' });
        router.push('/profile');
    };

    const handleCancel = () => {
        router.push('/profile');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <Avatar 
                                    className="h-24 w-24 border-4 border-primary cursor-pointer" 
                                    onClick={handleAvatarClick}
                                >
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} alt="Profile preview" />
                                    ) : profile.avatar ? (
                                        <AvatarImage src={profile.avatar} alt={profile.name} />
                                    ) : (
                                        <AvatarImage src={avatarImage.imageUrl} alt={profile.name} data-ai-hint={avatarImage.imageHint}/>
                                    )}
                                    <AvatarFallback className="text-3xl">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div 
                                    className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 cursor-pointer"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera className="h-4 w-4 text-primary-foreground" />
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">Click to change profile picture</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your 10-digit phone number"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself"
                                    rows={4}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
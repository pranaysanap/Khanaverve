'use client';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useUserStore } from '@/stores/use-user-store';
import { useCartStore } from '@/stores/use-cart-store';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { findImage } from '@/lib/data';
import { ShoppingCart } from 'lucide-react';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const { profile } = useUserStore();
  const avatarImage = findImage('profile-avatar', placeholderImages);
  const cartCount = useCartStore((s) => s.totalItems());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <ThemeToggle />
          {/* Chotu AI Avatar Shortcut */}
          <Link href="/ai" aria-label="Chotu Agent" className="ml-1">
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary bg-primary/90 text-primary-foreground transition-transform hover:scale-110">
              <AvatarFallback>
                <span className="flex flex-col items-center">
                  <Sparkles className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px] mt-0.5 font-bold">chotu</span>
                </span>
              </AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/checkout" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/profile">
            <Avatar className="h-9 w-9 cursor-pointer">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.name} />
              ) : (
                <AvatarImage src={avatarImage.imageUrl} alt={profile.name} data-ai-hint={avatarImage.imageHint} />
              )}
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
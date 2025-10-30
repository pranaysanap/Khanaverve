'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, ShoppingCart, ScrollText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/use-cart-store';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Vendors', icon: Utensils },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/orders', label: 'Orders', icon: ScrollText },
  { href: '/ai', label: 'Ask Chotu', icon: Sparkles },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCartStore();

  const cartItemCount = totalItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = (pathname === '/' && href === '/') || (pathname.startsWith(href) && href !== '/');
          return (
            <Link key={label} href={href} className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="relative">
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {label === 'Cart' && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
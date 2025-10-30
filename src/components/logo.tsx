import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
}

export default function Logo({ className, isCollapsed = false }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 text-lg font-bold font-headline', className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      {!isCollapsed && <span className="hidden md:inline">KhanaVerve</span>}
    </Link>
  );
}

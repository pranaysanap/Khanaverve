import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Tags, Truck } from 'lucide-react';
import type { Vendor } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';

interface VendorCardProps {
  vendor: Vendor;
}

export default function VendorCard({ vendor }: VendorCardProps) {
    const image = findImage(vendor.imageId, placeholderImages);

  return (
    <Link href={`/vendor/${vendor.id}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative h-48">
          <Image
            src={image.imageUrl}
            alt={vendor.name}
            data-ai-hint={image.imageHint}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            {vendor.rating.toFixed(1)}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-bold font-headline truncate group-hover:text-primary">{vendor.name}</h3>
          <p className="text-sm text-muted-foreground">{vendor.location}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {vendor.cuisine.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary">{c}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex justify-between items-center">
            <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{vendor.prepTime} mins</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Tags className="w-3.5 h-3.5" />
                    <span>From ₹{vendor.priceFrom}</span>
                </div>
            </div>
          <Button variant="outline" size="sm">
            View Menu
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Clock, MapPin, Utensils, Truck } from 'lucide-react';
import { getVendorById, findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DishCard from '@/components/dish-card';

interface VendorPageProps {
  params: { id: string };
}

export default function VendorPage({ params }: VendorPageProps) {
  const vendor = getVendorById(params.id);

  if (!vendor) {
    notFound();
  }
  const image = findImage(vendor.imageId, placeholderImages);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <Image
              src={image.imageUrl}
              alt={vendor.name}
              data-ai-hint={image.imageHint}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-4 bg-card p-4 rounded-lg border">
            <h1 className="text-3xl font-bold font-headline">{vendor.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
                <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{vendor.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{vendor.prepTime} mins</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{vendor.location}</span>
            </div>
            <Separator className="my-4" />
             <div className="flex flex-wrap gap-2">
                {vendor.cuisine.map((c) => (
                    <Badge key={c} variant="outline">{c}</Badge>
                ))}
            </div>
             <div className="flex flex-wrap gap-2 mt-2">
                {vendor.deliveryOptions.map((d) => (
                    <Badge key={d} variant="secondary">
                        <Truck className="w-3 h-3 mr-1.5"/>
                        {d}
                    </Badge>
                ))}
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold font-headline mb-4">Menu</h2>
          <div className="space-y-4">
            {vendor.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} vendorId={vendor.id} vendorName={vendor.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
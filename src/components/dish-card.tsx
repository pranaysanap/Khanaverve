'use client';
import Image from 'next/image';
import { Plus, Heart } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/use-cart-store';
import { useUserStore } from '@/stores/use-user-store';
import { findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';

interface DishCardProps {
  dish: Dish;
  vendorId: string;
  vendorName: string;
}

export default function DishCard({ dish, vendorId, vendorName }: DishCardProps) {
  const { addToCart } = useCartStore();
  const { addFavorite, isFavorite, removeFavorite } = useUserStore();
  const { toast } = useToast();
  const image = findImage(dish.imageId, placeholderImages);
  
  const isFav = isFavorite(dish.id);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(dish.id);
      toast({ title: 'Removed', description: `${dish.name} removed from favorites.` });
    } else {
      // Add vendor information to the dish when adding to favorites
      const dishWithVendor = {
        ...dish,
        vendorId,
        vendorName
      };
      addFavorite(dishWithVendor);
      toast({ title: 'Added', description: `${dish.name} added to favorites.` });
    }
  };

  return (
    <Card className="flex items-center p-4 transition-shadow hover:shadow-md">
      <div className="flex-grow flex">
         <Image
            src={image.imageUrl}
            alt={dish.name}
            data-ai-hint={image.imageHint}
            width={80}
            height={80}
            className="rounded-md object-cover mr-4"
          />
        <div>
          <h4 className="font-semibold">{dish.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{dish.description}</p>
          <p className="font-medium mt-2">₹{dish.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="outline" 
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-primary text-primary' : ''}`} />
          <span className="sr-only">{isFav ? 'Remove from favorites' : 'Add to favorites'}</span>
        </Button>
        <Button size="icon" variant="outline" onClick={() => addToCart(dish, vendorId)}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </div>
    </Card>
  );
}
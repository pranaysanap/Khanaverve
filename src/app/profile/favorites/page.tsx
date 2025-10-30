'use client';
import { useUserStore } from '@/stores/use-user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/use-cart-store';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
    const { favorites, removeFavorite } = useUserStore();
    const { toast } = useToast();
    const router = useRouter();
    const { addToCart } = useCartStore();

    const handleAddToCart = (dish: any) => {
        addToCart(dish, dish.vendorId);
        toast({ title: 'Added to Cart', description: `${dish.name} has been added to your cart.` });
    };

    const handleRemoveFavorite = (dishId: string, dishName: string) => {
        removeFavorite(dishId);
        toast({ title: 'Removed', description: `${dishName} has been removed from favorites.` });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <Heart className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Your Favorites</h1>
            </div>

            {favorites.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No favorites yet</h3>
                        <p className="mt-2 text-muted-foreground">Start adding dishes to your favorites to see them here.</p>
                        <Button className="mt-4" onClick={() => router.push('/explore')}>
                            Explore Dishes
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((dish) => (
                        <div key={dish.id} className="border rounded-lg overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-lg">{dish.name}</h3>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleRemoveFavorite(dish.id, dish.name)}
                                    >
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                                <p className="text-muted-foreground text-sm">{dish.vendorName}</p>
                                <p className="mt-2 font-medium">₹{dish.price}</p>
                                <div className="flex gap-2 mt-4">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleAddToCart(dish)}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
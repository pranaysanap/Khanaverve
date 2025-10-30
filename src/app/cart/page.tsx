'use client';
import { useCartStore } from '@/stores/use-cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { findImage } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/explore">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const image = findImage(item.dish.imageId, placeholderImages);
            return (
              <Card key={`${item.dish.id}-${item.vendorId}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={item.dish.name}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.dish.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.dish.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-semibold">₹{(item.dish.price * item.quantity).toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹49.00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>₹{(totalPrice() * 0.05).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{(totalPrice() + 49 + totalPrice() * 0.05).toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/checkout">
                  Proceed to Checkout <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
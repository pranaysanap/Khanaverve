'use client';
import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, ChevronsRight, Clock, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { vendors, locations } from '@/lib/data';
import VendorCard from '@/components/vendor-card';
import { placeholderImages } from '@/lib/placeholder-images.json';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = React.useState<string>('');
  // New hero background image (override)
  const heroImageUrl = 'https://images.unsplash.com/photo-1526312426976-593c2b999cd2?q=80&w=1920&auto=format&fit=crop';
  
  const filteredVendors = React.useMemo(() => {
    if (!selectedLocation) {
      return vendors.slice(0, 6); // Show first 6 vendors when no location selected
    }
    return vendors.filter(vendor => 
      vendor.location.toLowerCase() === selectedLocation.toLowerCase()
    ).slice(0, 6); // Show up to 6 vendors from selected location
  }, [selectedLocation]);

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Image
          src={heroImageUrl}
          alt="Delicious home-made meals background"
          fill
          className="object-cover scale-105"
          priority
        />
        {/* Gradient and pattern overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Truck className="h-3.5 w-3.5" /> Fast Delivery
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted Vendors
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Clock className="h-3.5 w-3.5" /> Freshly Prepared
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline drop-shadow-md">
            Home-Made Tiffins Near You
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-white/90 max-w-2xl">
            Fresh, Affordable, On Time — discover curated bhognalay and tiffin services around you.
          </p>

          {/* Glass location selector card */}
          <div className="mt-8 w-full max-w-xl">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/15 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
                <Select onValueChange={setSelectedLocation} value={selectedLocation}>
                  <SelectTrigger className="w-full bg-white/90 text-black">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc.toLowerCase()}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 justify-center md:justify-end">
                  <Button asChild size="default" className="bg-primary text-primary-foreground">
                    <Link href="/explore">Explore Vendors</Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
                    <Link href="/ai">Ask Chotu</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">
            {selectedLocation ? `Bhognalay & Tiffins in ${selectedLocation}` : 'Featured Bhognalay & Tiffins'}
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/explore">
              View All <ChevronsRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* Footer with features */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">On-time delivery across your selected locations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Freshly Prepared</h3>
                <p className="text-sm text-muted-foreground">Meals cooked just before dispatch.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Trusted Vendors</h3>
                <p className="text-sm text-muted-foreground">Curated, well-rated bhognalay and tiffin services.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Location-based</h3>
                <p className="text-sm text-muted-foreground">Discover the best options around you.</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} KhanaVerve. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

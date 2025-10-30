'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vendors, locations } from '@/lib/data';
import VendorCard from '@/components/vendor-card';

export default function ExplorePage() {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const filteredVendors = vendors.filter((vendor) => {
    const matchesLocation =
      selectedLocation === 'all' ||
      vendor.location.toLowerCase() === selectedLocation;
    return matchesLocation;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          Explore Vendors
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc.toLowerCase()}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No Vendors Found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
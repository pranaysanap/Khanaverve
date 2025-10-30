import type { Vendor } from './types';

const dishCatalog = [
  { name: 'Special Thali', description: 'Complete meal: rotis, rice, dal, sabzi, salad.', price: 150, category: 'Veg', imageId: 'dish-1' },
  { name: 'Paneer Butter Masala', description: 'Creamy tomato gravy with paneer.', price: 220, category: 'Veg', imageId: 'dish-2' },
  { name: 'Dal Makhani', description: 'Slow-cooked black lentils in buttery sauce.', price: 180, category: 'Veg', imageId: 'dish-3' },
  { name: 'Aloo Gobi', description: 'Potatoes and cauliflower with spices.', price: 160, category: 'Veg', imageId: 'dish-4' },
  { name: 'Veg Biryani', description: 'Aromatic rice with mixed vegetables.', price: 200, category: 'Veg', imageId: 'dish-5' },
  { name: 'Chicken Biryani', description: 'Fragrant rice layered with spiced chicken.', price: 260, category: 'Non-Veg', imageId: 'dish-6' },
  { name: 'Butter Chicken', description: 'Creamy tomato sauce with tender chicken.', price: 280, category: 'Non-Veg', imageId: 'dish-7' },
  { name: 'Tandoori Roti', description: 'Whole wheat flatbread from tandoor.', price: 20, category: 'Breads', imageId: 'dish-8' },
  { name: 'Naan', description: 'Soft leavened bread.', price: 30, category: 'Breads', imageId: 'dish-9' },
  { name: 'Gulab Jamun (2 pcs)', description: 'Milk-solid dumplings in syrup.', price: 60, category: 'Sweets', imageId: 'dish-10' },
  { name: 'Rasgulla (2 pcs)', description: 'Spongy cheese balls in syrup.', price: 60, category: 'Sweets', imageId: 'dish-11' },
  { name: 'Masala Dosa', description: 'Crisp dosa with spiced potato.', price: 120, category: 'Veg', imageId: 'dish-12' },
  { name: 'Rajma Chawal', description: 'Kidney beans curry with rice.', price: 140, category: 'Veg', imageId: 'dish-3' },
  { name: 'Fish Curry', description: 'Spicy fish curry with rice.', price: 300, category: 'Non-Veg', imageId: 'dish-5' },
  { name: 'Poha', description: 'Flattened rice with veggies.', price: 60, category: 'Veg', imageId: 'dish-4' },
  { name: 'Egg Curry', description: 'Eggs in spicy gravy.', price: 180, category: 'Non-Veg', imageId: 'dish-6' },
  { name: 'Sheera', description: 'Semolina sweet dish.', price: 50, category: 'Sweets', imageId: 'dish-10' },
  { name: 'Paratha', description: 'Stuffed Indian bread.', price: 40, category: 'Breads', imageId: 'dish-9' },
  { name: 'Sabudana Khichdi', description: 'Sago pearls with peanuts.', price: 90, category: 'Veg', imageId: 'dish-4' },
  { name: 'Shahi Paneer', description: 'Paneer in creamy gravy.', price: 230, category: 'Veg', imageId: 'dish-2' },
];

const generateDishes = (vendorId: string): Vendor['dishes'] => {
  // Pick 10 unique dishes for each vendor, rotate through the catalog for variety
  const offset = parseInt(vendorId, 10) % 10;
  return Array.from({ length: 10 }).map((_, idx) => {
    const dish = dishCatalog[(offset + idx) % dishCatalog.length];
    const isVeg = dish.name.toLowerCase().includes('paneer') || dish.name.toLowerCase().includes('veg');
    const isNonVeg = dish.name.toLowerCase().includes('chicken') || dish.name.toLowerCase().includes('fish') || dish.name.toLowerCase().includes('egg');
    return {
      id: `${vendorId}-d${idx + 1}`,
      name: dish.name,
      description: dish.description,
      price: dish.price + ((parseInt(vendorId, 10) * 3 + idx * 7) % 30), // add some price variety
      category: dish.category as Vendor['dishes'][number]['category'],
      imageId: dish.imageId,
      tag: isVeg ? 'Veg' : isNonVeg ? 'Non-Veg' : 'Other',
    };
  });
};

const baseCuisines = [
  ['North Indian', 'Maharashtrian'],
  ['South Indian', 'Thali'],
  ['Punjabi', 'Home Style'],
  ['Continental', 'North Indian'],
  ['Healthy', 'Salads'],
];

const vendorNamesByLocation: Record<string, string[]> = {
  Dombivli: [
    'Annapurna Tiffin Services',
    'Ghar Ka Swaad',
    'Purnabramha',
    'Sanjog',
    'Trupti',
  ],
  Thane: [
    'HomelyBite Bhoganalay',
    'Food-o-cracy',
    'Rajdhani',
    'Swadisht Rasoi',
    'Tiffin Express',
  ],
  Kalyan: [
    'DailyMeal Khanawal',
    'Maa Ka Khana',
    'HealthyThali',
    'Kalyan Spice House',
    'Kalyan Delight',
  ],
  Kurla: [
    'Kurla Kitchen',
    'Home Taste Kurla',
    'Kurla Rasoi',
    'Tiffin Junction',
    'Kurla Meals',
  ],
  'Navi Mumbai': [
    'Navi Mumbai Tiffins',
    'Palm Beach Bhoganalay',
    'Seawoods Kitchen',
    'Navi Mumbai Delight',
    'Navi Mumbai Spice House',
  ],
  Dadar: [
    'Dadar Tiffin Service',
    'Dadar Home Kitchen',
    'Shree Dadar Bhoganalay',
    'Dadar Rasoi',
    'Dadar Delight',
  ],
};

const generateVendorsForLocation = (location: string, count: number, startIndex: number): Vendor[] => {
  const names = vendorNamesByLocation[location] || [];
  const vendors: Vendor[] = [];
  for (let i = 0; i < count; i++) {
    const idNum = startIndex + i;
    const name = names[i] || `${location} Tiffin #${i + 1}`;
    const cuisine = baseCuisines[i % baseCuisines.length];
    const rating = 4 + ((i * 7) % 10) / 10; // 4.0 - 4.9
    const priceFrom = 100 + (i % 6) * 20; // 100,120,...,200
    const prepTime = 20 + (i % 5) * 5; // 20,25,...,40
    const imageId = location === 'Dadar' ? `dadar-${i + 1}` : location === 'Navi Mumbai' ? `navimumbai-food-${i + 1}` : `vendor-${idNum}`;
    vendors.push({
      id: String(idNum),
      name,
      location,
      rating,
      cuisine,
      deliveryOptions: i % 2 === 0 ? ['Delivery', 'Pickup'] : ['Delivery'],
      priceFrom,
      prepTime,
      imageId,
      dishes: generateDishes(String(idNum)),
    });
  }
  return vendors;
};

export const locations = [
  'Dombivli',
  'Thane',
  'Kalyan',
  'Kurla',
  'Navi Mumbai',
  'Dadar',
];

export const vendors: Vendor[] = locations.flatMap((loc, idx) =>
  generateVendorsForLocation(loc, 5, idx * 5 + 1)
);

export const getVendorById = (id: string) => vendors.find(v => v.id === id);

export const getDishesByVendorId = (vendorId: string) => {
  const vendor = getVendorById(vendorId);
  return vendor ? vendor.dishes : [];
};

export const findImage = (id: string, placeholderImages: any[]) => {
    return placeholderImages.find(p => p.id === id) || { imageUrl: "https://picsum.photos/seed/placeholder/400/300", description: "Placeholder Image", imageHint: "food" };
}

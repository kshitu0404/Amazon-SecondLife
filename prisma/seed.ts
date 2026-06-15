import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CATEGORIES = ['Electronics', 'Home & Kitchen', 'Apparel', 'Books/Media', 'Shoes'];
const CONDITIONS = ['like_new', 'very_good', 'good', 'acceptable'];
const BRANDS_BY_CAT: Record<string, string[]> = {
  'Electronics': ['Apple', 'Samsung', 'Sony', 'Dell', 'Google', 'Nintendo', 'Microsoft'],
  'Home & Kitchen': ['Ninja', 'Instant Pot', 'KitchenAid', 'Vitamix', 'Dyson', 'Bissell'],
  'Apparel': ['Nike', 'Patagonia', 'Levis', 'Ralph Lauren', 'Adidas', 'The North Face'],
  'Books/Media': ['Penguin', 'HarperCollins', 'Scholastic', 'Vintage', 'Bantam'],
  'Shoes': ['Nike', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans']
};

const COLORS = ['Black', 'White', 'Silver', 'Space Gray', 'Blue', 'Red', 'Green', 'Yellow', 'Navy'];
const SIZES = ['S', 'M', 'L', 'XL', 'One Size', '9', '10', '11', '12', '128GB', '256GB', '512GB'];

const CITIES = [
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
];

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.p2PMatch.deleteMany();
  await prisma.productHealthCard.deleteMany();
  await prisma.tradeIn.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  console.log('Generating 950 Products...');
  
  const imagesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'unsplashImages.json'), 'utf-8'));
  
  const categoryImageIndex: Record<string, number> = {
    'Electronics': 0,
    'Home & Kitchen': 0,
    'Apparel': 0,
    'Books/Media': 0,
    'Shoes': 0
  };

  const products = [];
  for (let i = 0; i < 950; i++) {
    const category = randomChoice(CATEGORIES);
    const brand = randomChoice(BRANDS_BY_CAT[category] || []);
    const color = randomChoice(COLORS);
    let size = null;
    if (category === 'Apparel') size = randomChoice(['S', 'M', 'L', 'XL']);
    if (category === 'Shoes') size = randomChoice(['8', '9', '10', '11', '12']);
    if (category === 'Electronics') size = randomChoice(['128GB', '256GB', '512GB', '1TB']);
    
    let baseName = `${brand} ${category} Item`;
    if (category === 'Electronics') baseName = `${brand} Smart Device ${i}`;
    if (category === 'Apparel') baseName = `${brand} Casual Wear ${i}`;
    if (category === 'Home & Kitchen') baseName = `${brand} Essential Appliance ${i}`;
    if (category === 'Books/Media') baseName = `${brand} Published Media ${i}`;
    if (category === 'Shoes') baseName = `${brand} Running Shoes ${i}`;

    const price = randomFloat(15, 800);
    
    const imageBaseUrls = imagesData[category] || imagesData['Electronics'];
    const currentIndex = categoryImageIndex[category] || 0;
    const baseUrl = imageBaseUrls[currentIndex % imageBaseUrls.length];
    categoryImageIndex[category] = currentIndex + 1;
    
    const image = `${baseUrl}?auto=format&fit=crop&q=80&w=600`;

    products.push({
      name: `${baseName} - ${color}` + (size ? ` (${size})` : ''),
      category,
      brand,
      color,
      size,
      price: Math.round(price * 100) / 100,
      image,
    });
  }

  // Create products one by one or in batches (SQLite handle limits)
  const createdProducts = [];
  for (let i = 0; i < products.length; i += 50) {
    const batch = products.slice(i, i + 50);
    // SQLite createMany doesn't return created rows in all versions, let's create individually to get IDs safely
    for (const p of batch) {
      createdProducts.push(await prisma.product.create({ data: p }));
    }
  }

  console.log(`Created ${createdProducts.length} Products. Generating 650 TradeIns...`);

  const tradeInsData = [];
  for (let i = 0; i < 650; i++) {
    const product = randomChoice(createdProducts);
    const location = randomChoice(CITIES);
    const latJitter = randomFloat(-0.05, 0.05);
    const lngJitter = randomFloat(-0.05, 0.05);
    
    const condition = randomChoice(CONDITIONS);
    
    tradeInsData.push({
      productId: product.id,
      condition,
      sellerNotes: condition === 'like_new' ? 'Used once, perfect condition.' : 'Has some wear and tear, fully functional.',
      sellerName: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES).charAt(0)}.`,
      sellerRating: Math.round(randomFloat(3.5, 5.0) * 10) / 10,
      city: location.city,
      state: location.state,
      lat: location.lat + latJitter,
      lng: location.lng + lngJitter,
      h3_index: '88264d123456789', // Fake H3 index for now
      status: 'LIVE_ON_MARKETPLACE',
    });
  }

  let count = 0;
  for (const tiData of tradeInsData) {
    const tradeIn = await prisma.tradeIn.create({
      data: tiData
    });

    let score = 90;
    if (tiData.condition === 'like_new') score = randomInt(95, 100);
    else if (tiData.condition === 'very_good') score = randomInt(85, 94);
    else if (tiData.condition === 'good') score = randomInt(70, 84);
    else score = randomInt(50, 69);

    await prisma.productHealthCard.create({
      data: {
        productName: `Passport for ${tiData.productId}`,
        conditionScore: score,
        damageDetection: 'AI Vision checked: No major structural damage. ' + tiData.sellerNotes,
        repairHistory: randomChoice(['No repairs', 'Battery replaced 1 year ago', 'Screen replaced', 'None recorded']),
        performanceHealth: `Tested at ${score}% efficiency`,
        aiRecommendation: 'Safe for marketplace resale.',
        authenticityVerified: true,
        tradeInId: tradeIn.id,
      }
    });

    count++;
    if (count % 100 === 0) console.log(`Created ${count} TradeIns...`);
  }

  console.log('Seeding complete! ✨');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

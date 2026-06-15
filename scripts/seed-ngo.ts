import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing NGO data...');
  await prisma.ngoRequest.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.ngo.deleteMany({});

  console.log('Seeding NGOs...');

  const ngos = [
    { name: 'Tech for Tomorrow', focusArea: 'Education Technology', location: 'Seattle, WA' },
    { name: 'Global Relief Initiative', focusArea: 'Disaster Relief', location: 'Portland, OR' },
    { name: 'Community Builders Network', focusArea: 'Local Housing', location: 'Austin, TX' },
    { name: 'Green Earth Defenders', focusArea: 'Environmental', location: 'Denver, CO' },
    { name: 'Books Without Borders', focusArea: 'Literacy', location: 'New York, NY' }
  ];

  const createdNgos = await Promise.all(
    ngos.map(n => prisma.ngo.create({ data: n }))
  );

  console.log('Seeding NGO Requests...');
  const categories = ['Electronics', 'Furniture', 'Apparel', 'Books', 'Toys'];
  const urgencies = ['High', 'Medium', 'Low'];
  const statuses = ['Open', 'Matched', 'Fulfilled'];

  for (const ngo of createdNgos) {
    for (let i = 0; i < 3; i++) {
      await prisma.ngoRequest.create({
        data: {
          ngoId: ngo.id,
          itemCategory: categories[Math.floor(Math.random() * categories.length)],
          quantityNeeded: Math.floor(Math.random() * 50) + 10,
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        }
      });
    }
  }

  console.log('Seeding Donations...');
  const conditions = ['like_new', 'very_good', 'good', 'acceptable'];
  const sources = ['Amazon Warehouse', 'Customer Return', 'Corporate Partner'];
  const donationStatuses = ['In Transit', 'Delivered', 'Distributed'];
  const items = [
    { name: 'Dell XPS 13', cat: 'Electronics', co2: 250, waste: 1.5, people: 1 },
    { name: 'Ergonomic Office Chair', cat: 'Furniture', co2: 120, waste: 15.0, people: 2 },
    { name: 'Winter Coat Bundle', cat: 'Apparel', co2: 45, waste: 4.5, people: 5 },
    { name: 'Educational Textbooks', cat: 'Books', co2: 15, waste: 10.0, people: 10 },
    { name: 'Kindle E-Reader', cat: 'Electronics', co2: 60, waste: 0.5, people: 1 }
  ];

  let donationCount = 0;
  for (let i = 0; i < 60; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const ngo = createdNgos[Math.floor(Math.random() * createdNgos.length)];
    const status = donationStatuses[Math.floor(Math.random() * donationStatuses.length)];
    
    // Some are unassigned if in transit
    const assignNgo = status !== 'In Transit' || Math.random() > 0.5;

    await prisma.donation.create({
      data: {
        itemName: item.name,
        category: item.cat,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        status: status,
        co2SavedKg: item.co2 * (Math.random() * 0.5 + 0.8), // random variance
        peopleImpacted: item.people,
        wasteDivertedKg: item.waste * (Math.random() * 0.5 + 0.8),
        ngoId: assignNgo ? ngo.id : null,
      }
    });
    donationCount++;
  }

  console.log(`Created ${createdNgos.length} NGOs and ${donationCount} Donations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const fs = require('fs');

const QUERIES = {
  'Electronics': { query: 'electronics gadget smartphone laptop', count: 50 },
  'Apparel': { query: 'clothing fashion apparel jacket shirt', count: 30 },
  'Books/Media': { query: 'books bookstore reading', count: 20 },
  'Home & Kitchen': { query: 'kitchen appliances home decor', count: 40 },
  'Shoes': { query: 'shoes sneakers footwear', count: 20 },
  'Sports': { query: 'sports equipment fitness', count: 20 },
  'Accessories': { query: 'fashion accessories watch sunglasses', count: 20 },
};

async function fetchIds() {
  const result = {};
  for (const [category, { query, count }] of Object.entries(QUERIES)) {
    try {
      // Unsplash returns 30 per page max sometimes, so we'll fetch 2 pages if count > 30
      let ids = [];
      const pages = Math.ceil(count / 30);
      for (let p = 1; p <= pages; p++) {
        const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30&page=${p}`);
        const data = await res.json();
        if (data.results) {
          ids.push(...data.results.map(r => r.urls.raw.split('?')[0])); // Base URL without query params
        }
      }
      // remove duplicates and slice to exact count
      ids = [...new Set(ids)].slice(0, count);
      result[category] = ids;
      console.log(`Fetched ${ids.length} images for ${category}`);
    } catch (e) {
      console.error(`Failed to fetch for ${category}`, e);
      result[category] = [];
    }
  }
  
  fs.writeFileSync('unsplashImages.json', JSON.stringify(result, null, 2));
  console.log('Saved to unsplashImages.json');
}

fetchIds();

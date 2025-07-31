const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function loadCSVData() {
  try {
    console.log('🔄 Starting data loading process...');
    
    // Check if products.csv exists
    const csvPath = './products.csv';
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  products.csv not found. Please download and extract the dataset.');
      console.log('📥 Download from: https://github.com/recruit41/ecommerce-dataset');
      return;
    }

    // Clear existing data
    await prisma.product.deleteMany({});
    await prisma.department.deleteMany({});
    
    console.log('🗑️  Cleared existing data');

    const products = [];
    const departments = new Set();

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Clean and validate data
          const product = {
            name: row.name || row.product_name || 'Unknown Product',
            description: row.description || row.product_description || '',
            price: parseFloat(row.price || row.product_price || 0),
            category: row.category || row.product_category || 'General',
            department: row.department || row.product_department || 'General',
            image: row.image || row.product_image || null,
            rating: parseFloat(row.rating || row.product_rating || 0),
            stock: parseInt(row.stock || row.product_stock || 0)
          };

          // Ensure price is valid
          if (isNaN(product.price) || product.price < 0) {
            product.price = 0;
          }

          // Ensure stock is valid
          if (isNaN(product.stock) || product.stock < 0) {
            product.stock = 0;
          }

          // Ensure rating is valid
          if (isNaN(product.rating) || product.rating < 0 || product.rating > 5) {
            product.rating = 0;
          }

          products.push(product);
          departments.add(product.department);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Loaded ${products.length} products from CSV`);
    console.log(`🏢 Found ${departments.size} departments`);

    // Create departments first (Milestone 4)
    const departmentData = Array.from(departments).map(name => ({ name }));
    for (const dept of departmentData) {
      try {
        await prisma.department.create({
          data: dept
        });
      } catch (error) {
        // Department might already exist, continue
        console.log(`Department ${dept.name} already exists or error:`, error.message);
      }
    }

    console.log('✅ Departments created');

    // Create products in batches
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      for (const product of batch) {
        try {
          await prisma.product.create({
            data: product
          });
        } catch (error) {
          console.log(`Error creating product ${product.name}:`, error.message);
        }
      }
      console.log(`📦 Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
    }

    console.log('✅ All products loaded successfully!');
    
    // Verify data
    const productCount = await prisma.product.count();
    const departmentCount = await prisma.department.count();
    
    console.log(`\n📈 Database Summary:`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Departments: ${departmentCount}`);

  } catch (error) {
    console.error('❌ Error loading data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
loadCSVData(); 
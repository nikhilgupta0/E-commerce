const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function loadComprehensiveData() {
  try {
    console.log('🔄 Starting comprehensive data loading process...');
    
    // Check if database folder exists
    const databasePath = '../database';
    if (!fs.existsSync(databasePath)) {
      console.log('⚠️  database folder not found. Please ensure the database folder is in the parent directory.');
      return;
    }

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.distributionCenter.deleteMany({});
    
    console.log('✅ Cleared existing data');

    // 1. Load Distribution Centers
    console.log('📦 Loading distribution centers...');
    const distributionCenters = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/distribution_centers.csv`)
        .pipe(csv())
        .on('data', (row) => {
          distributionCenters.push({
            id: parseInt(row.id),
            name: row.name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude)
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create distribution centers
    for (const dc of distributionCenters) {
      try {
        await prisma.distributionCenter.create({
          data: dc
        });
      } catch (error) {
        console.log(`Distribution center ${dc.name} already exists or error:`, error.message);
      }
    }
    console.log(`✅ Loaded ${distributionCenters.length} distribution centers`);

    // 2. Load Products
    console.log('📦 Loading products...');
    const products = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/products.csv`)
        .pipe(csv())
        .on('data', (row) => {
          products.push({
            id: parseInt(row.id),
            cost: parseFloat(row.cost || 0),
            category: row.category || 'General',
            name: row.name || 'Unknown Product',
            brand: row.brand || 'Unknown Brand',
            retailPrice: parseFloat(row.retail_price || 0),
            department: row.department || 'General',
            sku: row.sku || `SKU-${row.id}`,
            distributionCenterId: parseInt(row.distribution_center_id || 1)
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create products in batches
    const productBatchSize = 100;
    for (let i = 0; i < products.length; i += productBatchSize) {
      const batch = products.slice(i, i + productBatchSize);
      for (const product of batch) {
        try {
          await prisma.product.create({
            data: product
          });
        } catch (error) {
          console.log(`Error creating product ${product.name}:`, error.message);
        }
      }
      console.log(`📦 Processed products batch ${Math.floor(i / productBatchSize) + 1}/${Math.ceil(products.length / productBatchSize)}`);
    }
    console.log(`✅ Loaded ${products.length} products`);

    // 3. Load Users (sample for performance)
    console.log('👥 Loading users (sample)...');
    const users = [];
    let userCounter = 0;
    const maxUsers = 1000; // Limit for performance
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/users.csv`)
        .pipe(csv())
        .on('data', (row) => {
          if (userCounter < maxUsers) {
            users.push({
              id: parseInt(row.id),
              firstName: row.first_name || 'Unknown',
              lastName: row.last_name || 'User',
              email: row.email || `user${row.id}@example.com`,
              age: parseInt(row.age || 25),
              gender: row.gender || 'U',
              state: row.state || 'Unknown',
              streetAddress: row.street_address || 'Unknown Address',
              postalCode: row.postal_code || '00000',
              city: row.city || 'Unknown City',
              country: row.country || 'Unknown Country',
              latitude: parseFloat(row.latitude || 0),
              longitude: parseFloat(row.longitude || 0),
              trafficSource: row.traffic_source || 'Unknown'
            });
            userCounter++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create users
    for (const user of users) {
      try {
        await prisma.user.create({
          data: user
        });
      } catch (error) {
        console.log(`Error creating user ${user.email}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${users.length} users (sample)`);

    // 4. Load Inventory Items (sample for performance)
    console.log('📦 Loading inventory items (sample)...');
    const inventoryItems = [];
    let inventoryCounter = 0;
    const maxInventory = 5000; // Limit for performance
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/inventory_items.csv`)
        .pipe(csv())
        .on('data', (row) => {
          if (inventoryCounter < maxInventory) {
            inventoryItems.push({
              id: parseInt(row.id),
              productId: parseInt(row.product_id),
              cost: parseFloat(row.cost || 0),
              productCategory: row.product_category || 'General',
              productName: row.product_name || 'Unknown Product',
              productBrand: row.product_brand || 'Unknown Brand',
              productRetailPrice: parseFloat(row.product_retail_price || 0),
              productDepartment: row.product_department || 'General',
              productSku: row.product_sku || `SKU-${row.id}`,
              productDistributionCenterId: parseInt(row.product_distribution_center_id || 1)
            });
            inventoryCounter++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create inventory items
    for (const item of inventoryItems) {
      try {
        await prisma.inventoryItem.create({
          data: item
        });
      } catch (error) {
        console.log(`Error creating inventory item ${item.id}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${inventoryItems.length} inventory items (sample)`);

    // 5. Load Orders (sample for performance)
    console.log('📋 Loading orders (sample)...');
    const orders = [];
    let orderCounter = 0;
    const maxOrders = 2000; // Limit for performance
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/orders.csv`)
        .pipe(csv())
        .on('data', (row) => {
          if (orderCounter < maxOrders) {
            orders.push({
              id: parseInt(row.order_id),
              userId: parseInt(row.user_id),
              status: row.status || 'Pending',
              gender: row.gender || 'U',
              numOfItem: parseInt(row.num_of_item || 1)
            });
            orderCounter++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create orders
    for (const order of orders) {
      try {
        await prisma.order.create({
          data: order
        });
      } catch (error) {
        console.log(`Error creating order ${order.id}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${orders.length} orders (sample)`);

    // 6. Load Order Items (sample for performance)
    console.log('📋 Loading order items (sample)...');
    const orderItems = [];
    let orderItemCounter = 0;
    const maxOrderItems = 5000; // Limit for performance
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(`${databasePath}/order_items.csv`)
        .pipe(csv())
        .on('data', (row) => {
          if (orderItemCounter < maxOrderItems) {
            orderItems.push({
              id: parseInt(row.id),
              orderId: parseInt(row.order_id),
              userId: parseInt(row.user_id),
              productId: parseInt(row.product_id),
              inventoryItemId: parseInt(row.inventory_item_id),
              status: row.status || 'Pending',
              salePrice: parseFloat(row.sale_price || 0)
            });
            orderItemCounter++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create order items
    for (const item of orderItems) {
      try {
        await prisma.orderItem.create({
          data: item
        });
      } catch (error) {
        console.log(`Error creating order item ${item.id}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${orderItems.length} order items (sample)`);

    // Verify data
    const finalDistributionCenterCount = await prisma.distributionCenter.count();
    const finalProductCount = await prisma.product.count();
    const finalUserCount = await prisma.user.count();
    const finalInventoryCount = await prisma.inventoryItem.count();
    const finalOrderCount = await prisma.order.count();
    const finalOrderItemCount = await prisma.orderItem.count();
    
    console.log(`\n📈 Database Summary:`);
    console.log(`   Distribution Centers: ${finalDistributionCenterCount}`);
    console.log(`   Products: ${finalProductCount}`);
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Inventory Items: ${finalInventoryCount}`);
    console.log(`   Orders: ${finalOrderCount}`);
    console.log(`   Order Items: ${finalOrderItemCount}`);

    console.log('\n🎉 Comprehensive data loading completed successfully!');

  } catch (error) {
    console.error('❌ Error loading comprehensive data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive seeding
loadComprehensiveData(); 
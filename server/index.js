const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

// Milestone 2: REST API for Products (Enhanced)
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, category, brand, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (department) {
      where.department = department;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (brand) {
      where.brand = brand;
    }
    
    if (minPrice || maxPrice) {
      where.retailPrice = {};
      if (minPrice) where.retailPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.retailPrice.lte = parseFloat(maxPrice);
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        distributionCenter: {
          select: {
            name: true,
            latitude: true,
            longitude: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            inventoryItems: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.product.count({ where });
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        distributionCenter: true,
        orderItems: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              select: {
                status: true,
                createdAt: true
              }
            }
          }
        },
        inventoryItems: {
          where: {
            soldAt: null
          },
          take: 10
        },
        _count: {
          select: {
            orderItems: true,
            inventoryItems: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Distribution Centers API
app.get('/api/distribution-centers', async (req, res) => {
  try {
    const distributionCenters = await prisma.distributionCenter.findMany({
      include: {
        _count: {
          select: {
            products: true,
            inventoryItems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(distributionCenters);
  } catch (error) {
    console.error('Error fetching distribution centers:', error);
    res.status(500).json({ error: 'Failed to fetch distribution centers' });
  }
});

app.get('/api/distribution-centers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const distributionCenter = await prisma.distributionCenter.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        inventoryItems: {
          where: {
            soldAt: null
          },
          take: 10
        },
        _count: {
          select: {
            products: true,
            inventoryItems: true
          }
        }
      }
    });
    
    if (!distributionCenter) {
      return res.status(404).json({ error: 'Distribution center not found' });
    }
    
    res.json(distributionCenter);
  } catch (error) {
    console.error('Error fetching distribution center:', error);
    res.status(500).json({ error: 'Failed to fetch distribution center' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, gender, country } = req.query;
    const skip = (page - 1) * limit;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (gender) {
      where.gender = gender;
    }
    
    if (country) {
      where.country = country;
    }
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (page - 1) * limit;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                retailPrice: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.order.count({ where });
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Analytics API
app.get('/api/analytics', async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      topProducts,
      topCategories
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.orderItem.aggregate({
        _sum: {
          salePrice: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: {
          productId: true
        },
        _sum: {
          salePrice: true
        },
        orderBy: {
          _count: {
            productId: 'desc'
          }
        },
        take: 10
      }),
      prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      summary: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.salePrice || 0
      },
      ordersByStatus,
      topProducts,
      topCategories
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Data loading endpoint (for milestone 1)
app.post('/api/load-data', async (req, res) => {
  try {
    // This endpoint will be used to load CSV data
    res.json({ message: 'Data loading endpoint ready' });
  } catch (error) {
    console.error('Error in data loading:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 
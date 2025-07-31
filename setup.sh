#!/bin/bash

echo "🚀 Setting up E-Commerce Full Stack Application"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Setup database
echo "🗄️ Setting up database..."
cd server
npm run db:setup
cd ..

# Check if products.csv exists
if [ -f "server/products.csv" ]; then
    echo "✅ Found products.csv, loading data..."
    cd server
    npm run db:seed
    cd ..
else
    echo "⚠️  products.csv not found in server directory."
    echo "📥 Please download the dataset from: https://github.com/recruit41/ecommerce-dataset"
    echo "📁 Extract products.csv to the server directory"
    echo ""
    echo "For testing, you can copy the sample file:"
    echo "cp server/products-sample.csv server/products.csv"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README.md" 
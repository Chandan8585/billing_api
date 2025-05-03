const mongoose = require('mongoose');

const productlist = [
  {
    sku: 'PT001',
    warehouse: "Uttam Nagar Warehouse",
    store: "Uttam Nagar Store",
    gstType: true,
    gstRate: 12,
    brand: 'UrbanStyle',
    description: 'Medium black round-neck t-shirt made of 100% cotton.',
    quantity: 150,
    quantityAlert: 20,
    discountType: 'percentage',
    discountValue: 15,
    warratyType: 'days',
    warrantyPeriod: 30,
    manufacturedDate: new Date('2025-01-15'),
    manufacturedDate: new Date('2026-01-15'),
    barcodeSymbology: 'EAN-13',
    itemCode: 'URB-BLK-M',
    name: 'UrbanStyle Black T-Shirt - M',
    price: 425,
    originalPrice: 500,
    available: 130,
    sold: 20,
    discount: '15%',
    category: new mongoose.Types.ObjectId('68072ec2d5104b72ce47adf7'),
    image: [
      'http://localhost:3000/assets/img/products/stock-img-01.png'
    ],
    rating: {
      rate: 4.5,
      count: 73
    },
    fastMoving: true,
    hsn: '61091000',
    slug: 'urbanstyle-black-tshirt-m',
    counter: 'Apparel',
    unit: 'pcs',
    createdBy: new mongoose.Types.ObjectId('680b25d167951e52f977f963'), 
  },
  {
    sku: 'PT002',
    warehouse: "Uttam Nagar Warehouse",
    store: "Uttam Nagar Store",
    gstType: true,
    gstRate: 18,
    brand: 'Dell',
    description: 'Dell Inspiron 15, Intel i5, 8GB RAM, 512GB SSD',
    quantity: 40,
    quantityAlert: 5,
    discountType: 'fixed',
    discountValue: 3000,
    warratyType: 'months',
    warrantyPeriod: 24,
    manufacturedDate: new Date('2024-11-01'),
    expiry: new Date('2025-11-01'),
    barcodeSymbology: 'UPC',
    itemCode: 'DELL-INSP-I5',
    name: 'Dell Inspiron i5 - 8GB RAM',
    price: 47000,
    originalPrice: 50000,
    available: 35,
    sold: 5,
    discount: '₹3000 off',
    category: new mongoose.Types.ObjectId('661f1b29e204d6eae8a62b14'), 
    image: [
      'http://localhost:3000/assets/img/products/stock-img-02.png'
    ],
    rating: {
      rate: 4.7,
      count: 94
    },
    fastMoving: false,
    hsn: '84713010',
    slug: 'dell-inspiron-i5-8gb',
    counter: 'Electronics',
    unit: 'pcs',
    createdBy: new mongoose.Types.ObjectId('680b25d167951e52f977f963'), 
  }
  ];
  
module.exports = productlist
  
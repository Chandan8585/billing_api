const mongoose = require("mongoose");
const Store = require('../models/store');
   const seedStoreData = [
        {
          company: "Acme Corp",
          warehouse: "North Warehouse",
          store: "Electronics Store",
          createBy: new mongoose.Types.ObjectId('6807316324da458422e96d28') 
        },
        {
          company: "Acme Corp",
          warehouse: "South Warehouse",
          store: "Furniture Store",
          createBy: new mongoose.Types.ObjectId('6807316324da458422e96d28')
        },
        {
          company: "Globex Inc",
          warehouse: "East Warehouse",
          store: "Clothing Store",
          createBy: new mongoose.Types.ObjectId('6807316324da458422e96d2b')
        },
        {
          company: "Globex Inc",
          warehouse: "West Warehouse",
          store: "Grocery Store",
          createBy: new mongoose.Types.ObjectId('6807316324da458422e96d2b')
        }
];

module.exports =  seedStoreData ;  ;

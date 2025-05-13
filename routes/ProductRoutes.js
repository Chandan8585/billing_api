const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductConrollers');
const { userAuth } = require('../middlewares/userAuth');
const { validateProduct } = require('../middlewares/validations/productValidation');
const { singleImage } = require('../middlewares/multer.middleware');


router.get("/productList", productController.getProductList);
router.get("/generate-sku-code", productController.generateSkuCode);
router.get("/productList/:id", productController.getProductById);
router.post("/addNewProduct", validateProduct, userAuth, singleImage, productController.addNewProduct);
router.get("/filter", productController.filterProduct);

module.exports = router;

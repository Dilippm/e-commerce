const product = require('../models/productData');
const Category = require("../models/categoryData");
const fs = require('fs')
const sharp = require('sharp');
const multer = require('multer')
const loadProduct = async (req, res) => {
  try {
    const productdata = await product
      .find({})
      .populate('category');
    res.render('adminproduct', { productData: productdata })
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render('addproduct', { categories: categories });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}


const insertProduct = async (req, res) => {
  try {
    let images = [];
    let promises = [];

    req
      .files
      .forEach((file) => {
        promises.push(new Promise((resolve, reject) => {
          const filename = file
            .originalname
            .replace(/\..+$/, '');
          const newFilename = `electro-${filename}-${Date.now()}.jpeg`;

          sharp(file.path)
            .resize({ width: 500, height: 500 })
            .toFormat('jpeg', { quality: 100 })
            .toFile(`public/productImages/${newFilename}`, (err) => {
              if (err)
                reject(err);
              images.push(newFilename);
              resolve();
            });
        }));
      });

    await Promise.all(promises);

    //const prodStatus = req.body.stock_count == 0 ? 'Out Of Stock' : 'In Stock';

    const newProduct = new product({
      productName: req.body.productName,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      images: images
    });

    await newProduct.save();

    // req.session.message = {   type: 'success',   message: 'Product added
    // successfully', };
    res.redirect('/admin/product');
  } catch (error) {
    console.log(error.message);
    // req.session.message = {   type: 'danger',   message: 'Error occurred while
    // adding product', };
    res.render("500");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await product.deleteOne({ _id: id });
    res.redirect('/admin/product')
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}
const editProduct = async (req, res) => {
  try {
    const productData = await product
      .findById(req.params.id)
      .populate('category');
    const categoryData = await Category.find();
    res.render('editproduct', {
      product: productData,
      categories: categoryData
    });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}


const UpdateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let imgArray = [];

    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filename = req
          .files[i]
          .filename;
        const newFilename = `electro-${filename}-${Date.now()}.jpeg`;
        await sharp(req.files[i].path)
          .resize({ width: 600, height: 600 })
          .jpeg({
            quality: 100,
            // chromaSubsampling: '4:4:4'
          })
          .toFile(`public/productImages/${newFilename}`);
        imgArray.push(newFilename);
      }
    }

    const productData = {
      productName: req.body.productName,
      category: req.body.category,
      description: req.body.description,
      quantity: req.body.quantity,
      offers: [
        {
          discount: req.body.offer // Assuming there is an input field for discount value in your form
        }
      ]
    };
    if (imgArray.length > 0) {
      productData.images = imgArray;
    }
    // const productDoc = await product.findById(id).populate('category'); if
    // (!productDoc) {   return res.status(404).send("Product not found"); }
    let price = Number(req.body.price);
    const offer = Number(req.body.offer);
    let newPrice = price; // initialize newPrice with the original price
    if (offer > 0) {
      newPrice = Math.round(price - (price * offer / 100));
    }
    productData.price = newPrice; // assign the new price after subtracting the offer price

    await product.updateOne({
      _id: id
    }, { $set: productData });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

const viewdDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = await product
      .findOne({ _id: id })
      .populate('category');
    res.render('productdetails', { productdetail: productData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}
const unListProduct = async (req, res) => {
  try {
    
      const productId = req.params.id;
      
       await product.updateOne({
        _id:productId,
      },{
        $set:{
          listed:false
        }
      });
      
      res.redirect("/admin/product");
    } catch (error) {
    console.log(error.message);
    res.render("500");
   
  }
};
const ListProduct =async(req,res)=>{
  try {
    const productId = req.params.id;
    
     await product.updateOne({
      _id:productId,
    },{
      $set:{
        listed:true
      }
    });
   
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}

module.exports = {

  loadProduct,
  addProduct,
  insertProduct,

  deleteProduct,
  editProduct,
  UpdateProduct,
  viewdDetails,
  unListProduct,
  ListProduct

}
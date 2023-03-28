const express = require('express')
const adminRoute = express()
const bodyparser = require('body-parser')
const config = require('../config/config')
const auth = require('../middlewares/auth')
const nocache = require('nocache')
adminRoute.use(nocache());

const admincontroller = require('../controllers/admincontroller')
const categorycontroller = require('../controllers/categorycontroller')
const productcontroller = require('../controllers/productcontroller')
const adminusercontroller = require('../controllers/adminusercontroller')
const adminordercontroller = require('../controllers/adminordercontroller');
const adscontroller = require('../controllers/adscontroller');
const couponcontroller = require('../controllers/couponcontroller');

adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')

adminRoute.use(bodyparser.json())
adminRoute.use(bodyparser.urlencoded({extended: true}));
const path = require('path')
adminRoute.use(express.static(path.join(__dirname, 'public')))

// multer for image upload

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }

});
const upload = multer({storage: storage});

adminRoute.get('/', auth.isLogout, admincontroller.adminRegister)
adminRoute.post('/', admincontroller.verifylogin)

adminRoute.get('/dashboard', auth.isLogin, admincontroller.loadDashboard)

adminRoute.get('/logout', auth.isLogin, admincontroller.adminLogout)
adminRoute.get('/category', auth.isLogin, categorycontroller.adminCategory)
adminRoute.get(
    '/category/addcategory',
    auth.isLogin,
    categorycontroller.adminAddCategory
)
adminRoute.post('/category', categorycontroller.addNewCategory)
adminRoute.get(
    '/category/deletecategory/:id',
    auth.isLogin,
    categorycontroller.deleteCategory
);
adminRoute.get(
    '/category/editcategory/:id',
    auth.isLogin,
    categorycontroller.viewEditCategory
);
adminRoute.post('/category/editcategory/:id', categorycontroller.editCategory);
adminRoute.get('/product', auth.isLogin, productcontroller.loadProduct);
adminRoute.get(
    '/product/addproduct',
    auth.isLogin,
    productcontroller.addProduct
);
adminRoute.post(
    '/product',
    upload.array('images', 3),
    productcontroller.insertProduct
);
adminRoute.get(
    '/product/deleteproduct/:id',
    auth.isLogin,
    productcontroller.deleteProduct
);
adminRoute.get(
    '/product/editproduct/:id',
    auth.isLogin,
    productcontroller.editProduct
);
adminRoute.post(
    '/product/editproduct/:id',
    upload.array('images', 3),
    productcontroller.UpdateProduct
)
adminRoute.get('/product/viewdetails/:id', productcontroller.viewdDetails)
adminRoute.get('/product/unlistproduct/:id',productcontroller.unListProduct)
adminRoute.get('/product/listproduct/:id',productcontroller.ListProduct)
adminRoute.get('/user', auth.isLogin, adminusercontroller.loadUser);
adminRoute.get(
    '/user/blockuser/:id',
    auth.isLogin,
    adminusercontroller.blockUser
)
adminRoute.get(
    '/user/unblockuser/:id',
    auth.isLogin,
    adminusercontroller.unblockuser
);

adminRoute.get('/order', auth.isLogin, adminordercontroller.viewOrder);
adminRoute.post('/order/change-order-status', adminordercontroller.dropdown);
adminRoute.get('/order/detail/:id', adminordercontroller.orderDetails);
// sales Report
adminRoute.get('/salesreport', admincontroller.viewDailySalesReport);
// banner
adminRoute.get('/ads', auth.isLogin, adscontroller.loadAds);
adminRoute.get('/addAdds', auth.isLogin, adscontroller.addAdds);
adminRoute.post('/addAdds', upload.array('image', 1), adscontroller.insertAdds);
adminRoute.get('/editAdd/:id', auth.isLogin, adscontroller.loadEditBanner);
adminRoute.post(
    '/editAdd/:id',
    upload.array('image', 1),
    adscontroller.saveEditBanner
);
adminRoute.get('/ads/deleteadd/:id', auth.isLogin, adscontroller.deleteAdd);

// coupon
adminRoute.get('/coupons', auth.isLogin, couponcontroller.loadCoupons)
adminRoute.get('/addCoupons', auth.isLogin, couponcontroller.loadAddCoupon)
adminRoute.post('/addCoupons', couponcontroller.insertCoupon)
adminRoute.get(
    '/deleteCoupon/:id',
    auth.isLogin,
    couponcontroller.deleteCoupon
)
adminRoute.get('/EditCoupon/:id', auth.isLogin, couponcontroller.EditCoupon);
adminRoute.post('/EditCoupon/:id', couponcontroller.SaveCoupon);

adminRoute.get('*', function (req, res) {
    res.render('404')
})

module.exports = adminRoute;

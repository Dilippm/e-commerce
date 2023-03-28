const express = require('express')
const userRoute = express();
const sessions = require('express-session');
// middleware
const userauth = require("../middlewares/userauth");
const nocache = require('nocache')
userRoute.use(nocache());

const bodyparser = require('body-parser')
//controller
const usercontroller = require('../controllers/usercontroller')
const cartcontroller = require('../controllers/cartcontroller')
const ordercontroller = require('../controllers/ordercontroller')
const wishlistcontroller = require('../controllers/wishlistcontroller')
const couponController = require('../controllers/couponcontroller')
// morgan
const logger = require('morgan');
userRoute.use(logger('dev'));

//view engine
userRoute.set('view engine', 'ejs')
userRoute.set('views', './views/user')

//bodyparser
userRoute.use(bodyparser.urlencoded({extended: true}));
userRoute.use(bodyparser.json())

const path = require('path');

userRoute.use(express.static(path.join(__dirname, 'public')))

//user get routers

userRoute.get('/', userauth.islogout, usercontroller.guest);
userRoute.get(
    '/userhome',
    userauth.islogin,
    userauth.checkBlockedStatus,
    usercontroller.userHome
)

userRoute.get('/login', userauth.islogout, usercontroller.loadLogin);
userRoute.get('/register', userauth.islogout, usercontroller.loadRegister);
userRoute.get('/logout', userauth.islogin, usercontroller.userLogout);
userRoute.get(
    '/productview/:id',
    userauth.checkBlockedStatus,
    usercontroller.productView
)
userRoute.get('/cart', userauth.checkBlockedStatus, cartcontroller.viewCart);
userRoute.get(
    '/add-to-cart/:id',
    userauth.checkBlockedStatus,
    cartcontroller.addCart
);
userRoute.get(
    '/deletecart/:id',
    userauth.checkBlockedStatus,
    cartcontroller.deleteCart
);

userRoute.get('/profile', userauth.checkBlockedStatus, usercontroller.profile);
userRoute.get(
    '/address',
    userauth.checkBlockedStatus,
    usercontroller.addressView
);
userRoute.get(
    '/edit-user',
    userauth.checkBlockedStatus,
    usercontroller.editUser
);
userRoute.get(
    '/addAddress',
    userauth.checkBlockedStatus,
    usercontroller.addAddress
);
userRoute.get(
    '/editAddress/:id',
    userauth.checkBlockedStatus,
    usercontroller.editaddress
);
userRoute.get(
    '/removeAddress/:id',
    userauth.checkBlockedStatus,
    usercontroller.removeAddress
);
userRoute.get(
    '/checkout',
    userauth.checkBlockedStatus,
    ordercontroller.loadCheckOut
);

userRoute.get(
    '/orderlist',
    userauth.checkBlockedStatus,
    usercontroller.viewOrders
);
userRoute.get(
    '/details/:id',
    userauth.checkBlockedStatus,
    usercontroller.orderDetails
);
userRoute.get(
    '/success',
    userauth.checkBlockedStatus,
    ordercontroller.orderConfirmation
)
userRoute.get(
    '/products',
    userauth.checkBlockedStatus,
    usercontroller.allProductView
)
userRoute.get(
    '/wishlist',
    userauth.checkBlockedStatus,
    wishlistcontroller.loadWishlist
)
userRoute.get(
    '/addWishlist/:id',
    userauth.checkBlockedStatus,
    wishlistcontroller.addToWishlist
)
userRoute.get(
    '/removeWishlist/:id',
    userauth.checkBlockedStatus,
    wishlistcontroller.removeWishlist
)
userRoute.get(
    '/sort-products-by-category',
    userauth.checkBlockedStatus,
    usercontroller.sortProductCategory
)

// user post routers

userRoute.post('/register', usercontroller.verifySignup)

userRoute.post('/verifyotp', usercontroller.verifyOtp)

userRoute.post('/login', usercontroller.verifyLogin);
userRoute.post('/logout', usercontroller.verifyLogin);

userRoute.post('/editedProfile/:id', usercontroller.updateUser);
userRoute.post('/addAddress', usercontroller.insertAddress);
userRoute.post('/editAddress/:id', usercontroller.editedAddress);
userRoute.post('/change-Product-Quantity', cartcontroller.changeQuantity);
userRoute.post('/checkout', ordercontroller.successLoad);
userRoute.post('/verify-payment', ordercontroller.PaymentVerified)
userRoute.post('/cancel-order', usercontroller.cancelOrder);
userRoute.post('/returnOrder', usercontroller.returnOrder)
userRoute.post(
    '/addWishlist/:id',
    userauth.checkBlockedStatus,
    wishlistcontroller.addToWishlist
)
userRoute.post('/applycoupon', couponController.applyCoupon)
//PAGE NOT FOUNF HANDLEING
userRoute.use(function(req,res,next){
    res.render('404')
  })
  

module.exports = userRoute;
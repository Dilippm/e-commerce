const product = require('../models/productData')
const User = require('../models/userData')

const {ObjectId} = require("mongodb");

//view cart
const viewCart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const users = true;
            const userid = req.session.user_id
            const use = await User.findOne({_id: userid});

            const id = req.session.user_id;
            const userdetail = await User.findOne({_id: id});

            const cartDatas = await User
                .findOne({_id: userid})
                .populate('cart.product')
                .exec()

            const userdetails = await User.findOne({_id: userid});

            res.render('cart', {

                userdetails: userdetails,
                cartData: cartDatas,
                use,
                users

            })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

//add cart

const addCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const prodetails = await product.findOne({_id: productId});

        if (req.session.user_id) {

            const userId = req.session.user_id;
            const userDetail = await User.findOne({_id: userId});
            const found = await User.findOne({_id: userId, "cart.product": productId});
            const use = await User.findOne({_id: userId});

            if (found) {
                const userId = req.session.user_id;
                const deleteWishlist = await User.updateOne({
                    _id: userId
                }, {
                    $pull: {
                        wishlist: {
                            product: productId
                        }
                    }
                })
                res.json({exist: true})
            } else {
                const cartInserted = await User.updateOne({
                    _id: userId
                }, {
                    $push: {
                        cart: {
                            product: prodetails._id,
                            quantity: 1,
                            productTotalPrice: prodetails.price
                        }
                    }
                });

                // Update total price in user document
                const cartData = await User
                    .findOne({_id: userId})
                    .populate('cart.product');
                const totalPrice = cartData
                    .cart
                    .reduce((total, item) => {
                        return total + item.productTotalPrice;
                    }, 0);
                const updateTotalPrice = await User.updateOne({
                    _id: userId
                }, {
                    $set: {
                        totalPrice: totalPrice
                    }
                });

                const userDetails = await User.findOne({_id: userId});
                const deleteWishlist = await User.updateOne({
                    _id: req.session.user_id
                }, {
                    $pull: {
                        wishlist: {
                            product: productId
                        }
                    }
                })

                res.json({done: true})

                res.render('cart', {
                    userdetails: userDetails,
                    cartData: cartData,
                    users: true,
                    use
                });

            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

const deleteCart = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const productId = req.params.id;
            const userId = req.session.user_id;

            const deleted = await User.updateOne({
                _id: userId
            }, {
                $pull: {
                    cart: {
                        product: productId
                    }
                }
            });

            // Recalculate total price
            const user = await User
                .findOne({_id: userId})
                .populate('cart.product')
                .exec();
            let cartTotal = 0;
            for (let i = 0; i < user.cart.length; i++) {
                cartTotal += user
                    .cart[i]
                    .productTotalPrice;
            }
            const updatedUser = await User.updateOne({
                _id: userId
            }, {
                $set: {
                    totalPrice: cartTotal
                }
            });
            res.json({done: true})
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

//change quantity

const changeQuantity = async (req, res) => {
    try {
        if (req.session.user_id) {

            // const price1 = req.body.ptotal
            const prodId = req.body.product
            const productdetails = await product.findOne({_id: prodId})

            const count = req.body.count
            const user = await User.findOne({_id: req.session.user_id})
            const inc = await User.updateOne({
                _id: req.session.user_id,
                "cart.product": prodId
            }, {
                $inc: {
                    'cart.$.quantity': count
                }

            })
            const qnty = await User.findOne({
                _id: req.session.user_id,
                "cart.product": prodId
            }, {"cart.$": 1})

            const productprice = productdetails.price * qnty
                .cart[0]
                .quantity

            const inctotal = await User.updateOne({
                _id: req.session.user_id,
                "cart.product": prodId
            }, {
                $set: {
                    'cart.$.productTotalPrice': productprice
                }

            })

            const cart = await User
                .findOne({_id: req.session.user_id})
                .populate('cart.product')
                .exec()
            let cartTotal = 0;
            for (let i = 0; i < cart.cart.length; i++) {

                cartTotal += cart
                    .cart[i]
                    .productTotalPrice;
            }
          
            const add = await User.updateOne({
                _id: req.session.user_id
            }, {
                $set: {
                    totalPrice: cartTotal
                }
            })

            res.json({success: true, productprice, cartTotal})

        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

module.exports = {
    viewCart,
    addCart,
    deleteCart,
    changeQuantity
}
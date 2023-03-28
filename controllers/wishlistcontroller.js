const Product = require('../models/productData');
const User = require('../models/userData');
const Category = require('../models/categoryData');

const loadWishlist = async (req, res) => {
    try {
        if (req.session.user_id) {
            const users = true;
            const id = req.session.user_id;
            const userdetails = await User.findOne({_id: id});
            const wishlistData = await User
                .findOne({_id: userdetails._id})
                .populate('wishlist.product')
                .exec()
           
            const use = await User.findById({_id: id});
            const categorydata = await Category.find({})
            res.render('wishlist', {
                categorydata: categorydata,
                userdetails: userdetails,
                wishlistData: wishlistData,
                users,
                use
            })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const addToWishlist = async (req, res) => {
    try {
        if (req.session.user_id) {
            id = req.params.id;
            const found = await User.findOne(
                {_id: req.session.user_id, "wishlist.product": id}
            )
            if (found) {

                res.json({exist: true})
            } else {
                const id = req.session.user_id;
                const categorydata = await Category.find({})
                const userdetails = await User.findOne({_id: id})

                //const Id = req.session.user_id;

                const wishlistInserted = await User.updateOne({
                    _id: id
                }, {
                    $push: {
                        wishlist: {
                            product: req.params.id
                        }
                    }
                })

                const wishlistData = await User
                    .findOne({_id: userdetails._id})
                    .populate('wishlist.product')
                    .exec()

                res.json({done: true})
            }
        } else {
            // res.redirect('/login')
            res.json({logout: true})
        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const removeWishlist = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const users = true;
            const userId = req.session.user_id;
            const categorydata = await Category.find({})
            const userdetails = await User.findOne({_id: userId})
            const id = req.params.id;

            //username = req.session.user.username;
            const use = await User.findById({_id: req.session.user_id});

            const deleteWishlist = await User.updateOne({
                _id: userId
            }, {
                $pull: {
                    wishlist: {
                        product: id
                    }
                }
            })

            const wishlistData = await User
                .findOne({_id: userdetails._id})
                .populate('wishlist.product')
                .exec()
            res.render('wishlist', {
                categorydata: categorydata,
                userdetails: userdetails,
                wishlistData: wishlistData,
                users,
                use

            })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
module.exports = {
    loadWishlist,
    addToWishlist,
    removeWishlist

}
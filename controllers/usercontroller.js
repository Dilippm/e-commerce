const user = require('../models/userData')
const product = require('../models/productData')
const category = require('../models/categoryData')
const order = require('../models/orderData')
const ads = require('../models/adsData')

require('dotenv').config();
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authtoken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid, authtoken);

const bcrypt = require('bcrypt');
const {request} = require('../routes/userRoute');

//bcrypt password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }

}

// home page get

const guest = async (req, res) => {
    try {

        const data = await product.find({listed:true});
        const cat = await category.find();
        const banners = await ads.find({})
        const users = false;
        const topSellingProducts = await order.aggregate([
            {
                $unwind: "$product"
            }, {
                $group: {
                    _id: "$product.productId",
                    orderedQuantities: {
                        $push: "$product.quantity"
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$product.quantity", "$product.price"]
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    totalQuantityOrdered: {
                        $reduce: {
                            input: "$orderedQuantities",
                            initialValue: 0, in: {
                                $add: ["$$value", "$$this"]
                            }
                        }
                    },
                    totalRevenue: 1
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            }, {
                $unwind: "$product"
            }, {
                $sort: {
                    totalQuantityOrdered: -1
                }
            }, {
                $limit: 10
            }, // limit to top 10 products
        ]);
        res.render('homepage', {data, cat, users, banners, topSellingProducts})

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const userHome = async (req, res) => {
    try {
        if (req.session.user_id) {
            const id = req.session.user_id
            const users = true;
            const data = await product.find({listed:true});

            const cata = await category.find();
            const use = await user.findOne({_id: id});
            const banners = await ads.find({})
            const topSellingProducts = await order.aggregate([
                {
                    $unwind: "$product"
                }, {
                    $group: {
                        _id: "$product.productId",
                        orderedQuantities: {
                            $push: "$product.quantity"
                        },
                        totalRevenue: {
                            $sum: {
                                $multiply: ["$product.quantity", "$product.price"]
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        totalQuantityOrdered: {
                            $reduce: {
                                input: "$orderedQuantities",
                                initialValue: 0, in: {
                                    $add: ["$$value", "$$this"]
                                }
                            }
                        },
                        totalRevenue: 1
                    }
                }, {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                }, {
                    $unwind: "$product"
                }, {
                    $sort: {
                        totalQuantityOrdered: -1
                    }
                }, {
                    $limit: 10
                }, // limit to top 10 products
            ]);

            res.render('homepage', {
                data,
                cata,
                use,
                users,
                banners,
                topSellingProducts
            });

        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

// login page get
const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
// login page post
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await user.findOne({email: email});
        if (userData) {
            if (userData.status === true) {
                res.render('login', {message: 'Your account has been blocked.'});
                return;
            }
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData.id;
                res.redirect('/userhome');
                return;
            }
        }
        res.render('login', {message: 'Invalid email or password.'});
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

//register page get
const loadRegister = async (req, res) => {
    try {
        res.render('userregister');
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const verifySignup = async (req, res) => {

    req.session.userdata = req.body
    const found = await user.findOne({email: req.body.email})
    if (found) {
        res.render('userregister', {message: "email or mobile already exist"});
    } else if (req.body.name == '' || req.body.email == '' || req.body.password == '' || req.body.mobile == '') {
        res.render('signup', {message: "All fields are required"});
    } else {
    
        phonenumber = req.body.mobile;
        try {

            const otpResponse = await client
                .verify
                .v2
                .services('VA5d6b573510fb1b3d0f42fc7b41df4025')
                .verifications
                .create({to: `+91${phonenumber}`, channel: 'sms'});
            res.render('otppage')
        } catch (error) {
            console.log(error.message);
            res.render("500");
        }
    }
}

//verifying otp
const verifyOtp = async (req, res, next) => {
    const otp = req.body.otp;
    try {
        req.session.user
        const details = req.session.userdata;

        const verifiedResponse = await client
            .verify
            .v2
            .services('VA5d6b573510fb1b3d0f42fc7b41df4025')
            .verificationChecks
            .create({to: `+91${details.mobile}`, code: otp})
       
        if (verifiedResponse.status === 'approved') {
            details.password = await bcrypt.hash(details.password, 10)
            const userdata = new user({
                name: details.name,
                // lastname: details.lastname,
                email: details.email,
                // username: details.username,
                password: details.password,
                mobile: details.mobile

            })
            const userData = await userdata.save();
          
            req.session.user = userData
            if (userData) {
                res.redirect('/userhome');
            } else {
                res.render('otppage', {message: "wrong otp"})
            }

        } else {
            res.render('otppage', {message: "wrong otp"})
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

// user logout
const userLogout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }

}

const productView = async (req, res) => {
    try {
        let id = req.params.id;
        const productData = await product
            .findOne({_id: id})
            .populate('category');
        const users = Boolean(req.session.user_id);
        const use = await user.findOne({_id: req.session.user_id});

        res.render('productview', {
            productdetails: productData,
            users,
            use
        });
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const profile = async (req, res) => {
    try {

        if (req.session.user_id) {
            const users = true;
            const userid = req.session.user_id;
            const use = await user.findOne({_id: userid})
            const userdetail = await user.findOne({_id: userid})

            res.render('userprofile', {
                userdetails: userdetail,
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

const editUser = async (req, res) => {

    const users = true;
    const userid = req.session.user_id;
    const use = await user.findById({_id: userid});
    // const id = req.params.id   const userData =await user.findById({ _id:id })
    res.render('edit-user', {users, use})

}
const updateUser = async (req, res) => {
    try {

        if (req.session.user_id) {
            const update = await user.updateOne({
                _id: req.session.user_id
            }, {
                $set: {
                    name: req.body.name,

                    email: req.body.email,
                    mobile: req.body.mobile
                }
            })
            res.redirect('/userhome')
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.render("500");
    }
}

const addressView = async (req, res) => {

    try {
        if (req.session.user_id) {
            const users = true;
            const userid = req.session.user_id;
            const userdetails = await user.findOne({_id: userid})
            const data = await user.findOne({_id: userdetails._id})
            const use = await user.findById({_id: userid});

            res.render('address', {
                userdetails: userdetails,
                datas: data,
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

const addAddress = async (req, res) => {
    try {
        const users = true;
        const userid = req.session.user_id;
        const use = await user.findById({_id: userid});
        res.render('addAddress', {users, use})
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

//insert address
const insertAddress = async (req, res) => {
    try {

        if (req.session.user_id) {

            const addressinserted = await user.updateOne({
                _id: req.session.user_id
            }, {
                $push: {
                    address: {
                        name: req.body.name,
                        houseName: req.body.hname,
                        street: req.body.street,
                        district: req.body.district,
                        country: req.body.country,
                        state: req.body.state,
                        pincode: req.body.pincode,
                        phone: req.body.number
                    }
                }
            })
            res.redirect('/address')
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

// edit address
const editaddress = async (req, res) => {
    try {
        if (req.session.user_id) {
            const users = true;
            const id = req.params.id
            const userdetails = req.session.user_id;
            const use = await user.findById({_id: userdetails});
            const edit = await user.findOne({
                _id: userdetails,
                "address._id": id
            }, {"address.$": 1})

            res.render('editaddress', {
                edit: edit,
                userdetails: userdetails,
                use,
                users
            });
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }

}
//edited address inserting
const editedAddress = async (req, res) => {
    try {
        if (req.session.user_id) {
            id = req.params.id;

            await user.updateOne({
                _id: req.session.user_id,
                "address._id": id
            }, {
                $set: {
                    "address.$": req.body
                }
            })
            res.redirect('/address')
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const removeAddress = async (req, res) => {
    try {
        if (req.session.user_id) {
            const id = req.params.id;
            const userid = req.session.user_id;
            const removeinserted = await user.updateOne({
                _id: userid
            }, {
                $pull: {
                    address: {
                        _id: id
                    }
                }
            })
            res.redirect('/address')

        } else {
            res.redirect('/login');

        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const viewOrders = async (req, res) => {
    try {
        if (req.session.user_id) {
            const users = true;
            const userId = req.session.user_id;
            const userDetails = await user.findOne({_id: userId});
            const orderDetails = await order
                .find({userId: userId})
                .populate('product.productId')
                .sort({date: -1});

            res.render('orderlist', {
                users,
                use: await user.findById(userId),
                userdetails: userDetails,
                orderDetail: orderDetails
            });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId;

        // Find the order to cancel
        const orderToCancel = await order
            .findOne({_id: orderId})
            .populate('product.productId');

        // Update the order status and status field
        orderToCancel
            .orderStatus
            .push({status: 'Cancelled', date: new Date()});
        orderToCancel.status = "Cancelled";
        await orderToCancel.save();

        // Update the quantity of products
        for (let i = 0; i < orderToCancel.product.length; i++) {
            await product.updateOne({
                _id: orderToCancel
                    .product[i]
                    .productId
            }, {
                $inc: {
                    quantity: orderToCancel
                        .product[i]
                        .quantity
                }
            });
        }

        // Update user's wallet balance if payment method is "wallet" or "UPI"
        if (orderToCancel.paymentType && (orderToCancel.paymentType === "wallet" || orderToCancel.paymentType === "UPI")) {
            await user.updateOne({
                _id: orderToCancel.userId
            }, {
                $inc: {
                    wallet: orderToCancel.total
                }
            });
        }

        res.send('Order cancelled successfully');
    } catch (error) {
        console.log(error.message);
        res
            .status(500)
            .send('Error cancelling order');
    }
};

const orderDetails = async (req, res) => {
    try {
        if (req.session.user_id) {
            const orderId = req.params.id;
            const users = true;
            const userId = req.session.user_id;

            const orderDetails = await order
                .findById(orderId)
                .populate('product.productId');
            res.render('orderdetails', {
                users,
                use: await user.findById(userId),

                orderDetail: orderDetails
            });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }

}
const allProductView = async (req, res) => {
    try {
        let pages = 1
        pages = req.query.page
        //const page = parseInt(req.query.page) || 1;  current page, default to 1
        const limit = 10; // number of products per page
        // const startIndex = (page - 1) * limit;  starting index for the page const
        // endIndex = page * limit;  ending index for the page

        let id,
            users;
        if (req.session.user_id) {
            id = req.session.user_id;
            users = true;
        } else {
            users = false;
        }

        const data = await product
            .find({listed:true})
            .populate("category")
            .limit(limit)
            .skip((pages - 1) * limit)
            .exec()

        const cata = await category.find();

        const use = await user.findOne({_id: id});

        const topSellingProducts = await order.aggregate([
            {
                $unwind: "$product"
            }, {
                $group: {
                    _id: "$product.productId",
                    orderedQuantities: {
                        $push: "$product.quantity"
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$product.quantity", "$product.price"]
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    totalQuantityOrdered: {
                        $reduce: {
                            input: "$orderedQuantities",
                            initialValue: 0, in: {
                                $add: ["$$value", "$$this"]
                            }
                        }
                    },
                    totalRevenue: 1
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            }, {
                $unwind: "$product"
            }, {
                $sort: {
                    totalQuantityOrdered: -1
                }
            }, {
                $limit: 10
            }, // limit to top 10 products
        ]);
        const countproducts = await product
            .find()
            .countDocuments()
        //const totalProducts = await product.countDocuments();
        const countdata = Math.ceil(countproducts / limit); // calculate total number of pages

        res.render("allproduct", {
            data,
            cata,
            use,
            users,
            topSellingProducts,
            currentPage: pages,
            countproducts: countdata
        });
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

const returnOrder = async (req, res) => {
    try {
        if (req.session.user_id) {
           
            if (req.body.one == undefined) {
                res.json({error: true});
            } else {
                const updateOrder = await order.updateOne({
                    _id: req.body.order
                }, {
                    $set: {
                        returnReason: req.body.one,
                        status: "Return Pending"
                    }
                });
              
                res.json({status: true});
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        res.json({error: true});
    }
};
const sortProductCategory = async (req, res) => {
    try {

        const selectedCategory = req.query.category;
        if (selectedCategory === "all") {
            res.redirect('/products');
        } else {

            let id,
                users;
            if (req.session.user_id) {

                id = req.session.user_id;
                users = true;
            } else {
                users = false;
            }
            const data = await product
                .find({"category": req.query.category})
                .populate("category");

            const cata = await category.find();

            const use = await user.findOne({_id: id});

            const topSellingProducts = await order.aggregate([
                {
                    $unwind: "$product"
                }, {
                    $group: {
                        _id: "$product.productId",
                        orderedQuantities: {
                            $push: "$product.quantity"
                        },
                        totalRevenue: {
                            $sum: {
                                $multiply: ["$product.quantity", "$product.price"]
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        totalQuantityOrdered: {
                            $reduce: {
                                input: "$orderedQuantities",
                                initialValue: 0, in: {
                                    $add: ["$$value", "$$this"]
                                }
                            }
                        },
                        totalRevenue: 1
                    }
                }, {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                }, {
                    $unwind: "$product"
                }, {
                    $sort: {
                        totalQuantityOrdered: -1
                    }
                }, {
                    $limit: 10
                }, // limit to top 10 products
            ]);

            res.render("allproduct", {data, cata, use, users, topSellingProducts})

        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
module.exports = {
    guest,
    userHome,

    loadLogin,
    loadRegister,

    verifySignup,
    verifyOtp,
    verifyLogin,
    userLogout,
    productView,

    profile,
    editUser,
    updateUser,
    addressView,
    addAddress,
    insertAddress,
    editaddress,
    editedAddress,
    removeAddress,
    viewOrders,
    cancelOrder,
    orderDetails,
    allProductView,
    returnOrder,
    sortProductCategory

}
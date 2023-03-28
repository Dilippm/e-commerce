const admin = require('../models/adminData');
const Product = require('../models/productData');
const User = require('../models/userData');
const Order = require('../models/orderData');
const Category = require('../models/categoryData');
const moment = require('moment');

//Renders the admin login page
const adminRegister = async (req, res) => {
    try {
        // Render the admin login page
        res.render('adminlogin');

    } catch (error) {
        // Log any errors that occur
        console.log(error.message);
        res.render("500");
    }
}
// verify admin login
const verifylogin = async (req, res) => {
    try {
        // Extract the email and password properties from the request body
        const email = req.body.email
        const password = req.body.password

        // Find an admin in the database with the matching email and password
        const adminData = await admin.findOne({ email: email, password: password });

        // If an admin is found, set the admin_id property in the session to the admin's
        // _id and redirect to the admin dashboard
        if (adminData) {
            req.session.admin_id = adminData._id;
            res.redirect(
                '/admin/dashboard' // If an admin is not found, render the admin login page with an error message
            )
        } else {
            res.render('adminlogin', { message: "invalid email or password" })
        }

    } catch (error) {
        // Log any errors that occur
        console.log(error.message)
        res.render("500");
    }
}
//loading the dashboard page
const loadDashboard = async (req, res) => {
    try {
        // Fetch all categories
        const categoryData = await Category.find({});

      

        // Fetch all products and populate their category field
        const productData = await Product
            .find({})
            .populate('category')
            .exec();

        // Count the number of orders with a status of 'Delivered'
        const salesCount = await Order
            .find({ status: "Delivered" })
            .count();

        // Count the total number of users in the system
        const totalUsers = await User
            .find({})
            .count();

        // Calculate the total revenue generated in the last week from all delivered
        // orders
        const weeklyRevenue = await Order.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Find orders from the last 7 days
                    }
                }
            }, {
                $match: {
                    status: 'Delivered' // Only consider delivered orders
                }
            }, {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$total' // Sum the total field of all matching orders
                    }
                }
            }
        ]);

        // Find all users who signed up in the last week
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const usersForTheLastWeek = await User.find({
            date: {
                $gte: lastWeek
            }
        });

        // Aggregate order data to create a chart of sales over the last 7 days
        const salesChart = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    sales: {
                        $sum: '$total' // Sum the total field of all orders for each day
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }, {
                $limit: 7 // Limit the results to the last 7 days
            }
        ]);

        // Extract the sales and date fields from the chart data
        const date = salesChart.map((item) => {
            return item._id;
        });
        // Get the sales data for the sales chart
        const sales = salesChart.map((item) => {
            return item.sales;
        });

        const pending = await Order
            .find({ status: 'Pending' })
            .count();
        const processing = await Order
            .find({ status: 'Processing' })
            .count();
        const delivered = await Order
            .find({ status: 'Delivered' })
            .count();
        const shipped = await Order
            .find({ status: 'Shipped' })
            .count();
        const cancelled = await Order
            .find({ status: 'Cancelled' })
            .count();
        const Returned = await Order
            .find({ status: 'Return Pending' })
            .count();
        const UPI = await Order
            .find({ paymentType: 'UPI' })
            .count();
        const COD = await Order
            .find({ paymentType: 'COD' })
            .count();
        const wallet = await Order
            .find({ paymentType: 'wallet' })
            .count();

        const topSellingProducts = await Order.aggregate([
            {
                $unwind: '$product'
            }, {
                $group: {
                    _id: '$product.productId',
                    orderedQuantities: {
                        $push: '$product.quantity'
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ['$product.quantity', '$product.price']
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    totalQuantityOrdered: {
                        $reduce: {
                            input: '$orderedQuantities',
                            initialValue: 0, in: {
                                $add: ['$$value', '$$this']
                            }
                        }
                    },
                    totalRevenue: 1
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $unwind: '$product'
            }, {
                $sort: {
                    totalQuantityOrdered: -1
                }
            }, {
                $limit: 10
            }, // limit to top 10 products
        ]);

        const recentSales = await Order
            .find({})
            .sort({ date: -1 })
            .limit(10)
            .populate('userId', 'name') // populate user name
            .populate({
                path: 'product.productId', select: 'productName price', // select product name and price
            })
            .populate({
                path: 'orderStatus', select: 'status', // select only the status field

            })
            .exec();
        res.render('dashboard', {
            totalUsers,
            salesCount,
            productData,
            categoryData,
            weeklyRevenue,

            usersForTheLastWeek,
            processing,
            pending,
            delivered,
            shipped,
            cancelled,
            Returned,
            UPI,
            COD,
            wallet,
            sales,
            date,
            moment,
            topSellingProducts,
            recentSales
        });
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};
//admin logout
const adminLogout = async (req, res) => {
    try {
        // Clear the admin_id session variable
        req.session.admin_id = null;
        // Redirect to the admin login page
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

// Daily sales report
const viewDailySalesReport = async (req, res) => {
    try {
        const orders = await Order
            .find()
            .populate({ path: "product.productId", select: "productName price" });

        // Create a new object to store total sales for each product by day
        const salesByDayAndProduct = {};

        // Iterate over each order and update salesByDayAndProduct with the total sales
        // for each product by day
        orders.forEach((order) => {
            const orderDate = new Date(order.date);
            const day = orderDate
                .toISOString()
                .substring(0, 10);

            order
                .product
                .forEach((product) => {
                    const productName = product.productId.productName;
                    const productSalesTotal = product.quantity * product.productId.price;

                    if (!(day in salesByDayAndProduct)) {
                        salesByDayAndProduct[day] = {};
                    }

                    if (productName in salesByDayAndProduct[day]) {
                        salesByDayAndProduct[day][productName].quantitySold += product.quantity;
                        salesByDayAndProduct[day][productName].totalSales += productSalesTotal;
                    } else {
                        salesByDayAndProduct[day][productName] = {
                            quantitySold: product.quantity,
                            totalSales: productSalesTotal
                        };
                    }
                });
        });

        res.render("salesreport", { salesByDayAndProduct });
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

module.exports = {
    adminRegister,
    verifylogin,
    loadDashboard,

    adminLogout,
    viewDailySalesReport
}

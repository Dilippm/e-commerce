const category = require('../models/categoryData')
const product = require('../models/productData')

const adminCategory = async (req, res) => {
    try {
        const categorydata = await category.find({})
        res.render('admincategory', {categoryData: categorydata})

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }

}

const adminAddCategory = async (req, res) => {
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const addNewCategory = async (req, res) => {
    try {
        const capcategory = req.body.category
        const capital = capcategory.toUpperCase()
        let result = await category.findOne({category: capital})
        if (result) {
            result = null
            res.render('addcategory', {message: "Category already exists"})
          

        } else {
            const newCategory = new category(
                {category: capital, description: req.body.description}
            )

            const CategoryData = await newCategory.save()
            if (CategoryData) {
                res.redirect('/admin/category');
            } else {
                res.render('addcategory', {message: "No Category is added"})
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        
        const products = await product.find({category: id});
        if (products.length > 0) {
            // Render the same page with an error message
            const categoryData = await category.find();
            res.render(
                "admincategory",
                {categoryData, message: "Cannot delete category. There are products associated with this category ."}
            );
        } else {
            await category.deleteOne({_id: id});
            res.redirect("/admin/category");
        }
    } catch (error) {
        console.log(error.message);
        //res.status(500).json({ message: "Error occurred while deleting category" });
        res.render("500");
    }
};

const viewEditCategory = async (req, res) => {
    try {
        const id = req.params.id;
        
        const categorydata = await category.findById({_id: id})
        res.render('editcategory', {vcategory: categorydata});
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const editCategory = async (req, res) => {
    try {
        let newData = req.body.newcategory;
        let newdescription = req.body.newdescription;
       
        let capData = newData.toUpperCase();

        const id = req.params.id;

        // Check if category already exists
        const existingCategory = await category.findOne({category: capData});

        if (existingCategory && existingCategory._id != id) {
            res.render('editcategory', {
                message: "Category already exists",
                vcategory: existingCategory
            });
        } else {
            const collectedData = await category.findById(id);
            if (collectedData.category == capData) {
                if (collectedData.description == newdescription) {
                    res.render('editcategory', {
                        message: "No change made",
                        vcategory: collectedData
                    });
                } else {
                    await category.updateOne({
                        _id: id
                    }, {
                        $set: {
                            description: newdescription
                        }
                    });
                    res.redirect('/admin/category');
                }
            } else {
                await category.updateOne({
                    _id: id
                }, {
                    $set: {
                        category: capData,
                        description: newdescription
                    }
                });
                res.redirect('/admin/category');
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
};

module.exports = {

    adminCategory,
    adminAddCategory,
    addNewCategory,

    deleteCategory,
    viewEditCategory,
    editCategory

}
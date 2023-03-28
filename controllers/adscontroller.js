const Ads = require('../models/adsData');
const Category = require('../models/categoryData');

const loadAds = async (req, res) => {
    try {
        const adds = await Ads.find({})
        res.render('add_ads', {add: adds})
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const addAdds = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render('add_view', {categoryData: categoryData})
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const insertAdds = async (req, res) => {
    try {
        const images = [];
        for (file of req.files) {
            images.push(file.filename);
        }
        const add = new Ads({name: req.body.head, image: images});
        const added = await add.save();
        if (added) {

            res.redirect('/admin/ads');
        } else {

            res.render('add_view', {message: "action failed"});

        }
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const loadEditBanner = async (req, res) => {
    try {
        id = req.params.id
        const details = await Ads.find({_id: id})
        res.render('edit_add', {details: details})
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const saveEditBanner = async (req, res) => {
    try {
        const id = req.params.id;
        const image = [];
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                image.push(req.files[i].filename);
            }
        }
        // await Ads.updateOne({ _id: id }, {     $set: {       name: req.body.head,
        // image: images,     }   })
        const addData = {
            name: req.body.name
        };
        if (image.length > 0) {
            addData.image = image;
        }
        await Ads.updateOne({
            _id: id
        }, {$set: addData});

        res.redirect('/admin/ads');
    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}
const deleteAdd = async (req, res) => {
    try {
        const id = req.params.id;
      
        await Ads.deleteOne({_id: id})
        res.redirect('/admin/ads');

    } catch (error) {
        console.log(error.message);
        res.render("500");
    }
}

module.exports = {
    loadAds,
    addAdds,
    insertAdds,
    loadEditBanner,
    saveEditBanner,
    deleteAdd

}
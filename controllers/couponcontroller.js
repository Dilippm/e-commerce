const Category = require('../models/categoryData');
const Product = require('../models/productData');
const User = require('../models/userData');
const Order = require('../models/orderData');
const moment=require('moment');
const Coupon =require('../models/couponData');
//const couponData = require('../models/couponData');


//view coupon
const loadCoupons=async (req,res)=>{
    try {
        const coupons=await Coupon.find({})
        res.render('coupons',{coupons:coupons,moment:moment})
    } catch (error) {
        console.log(error.message);
    }
}
//load add coupon
const loadAddCoupon=async (req,res)=>{
    try {
        res.render('addcoupon')
    } catch (error) {
       console.log(error.message);
    }
}

//insert coupon to database
const insertCoupon=async (req,res)=>{
    try {
        
       
       const coupon=new Coupon({
        code:req.body.code,
        discount:req.body.discount, 
        expirationDate:req.body.expirationDate,
        maxDiscount:req.body.maxDiscount,
        MinPurchaceAmount:req.body.MinPurchaceAmount,
        percentageOff:req.body.percentageOff
       })
       const saving=await coupon.save()
       res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
    }
}

//delete coupon
const deleteCoupon=async (req,res)=>{
    try {
       
      const id=req.params.id
      
      await Coupon.deleteOne({_id:id})
      res.redirect('/admin/coupons')
    } catch (error) {
       console.log(error.message);
    }
}
//edit coupon
const EditCoupon=async(req,res,next)=>{
    try {
        const id=req.params.id
    const couponDta=await Coupon.findOne({_id:id})
    
        res.render('editcoupon',{coupondata:couponDta})
    } catch (error) {
       console.log(error.message);
    }
}
//save coupon
const SaveCoupon=async(req,res)=>{
    try {
        const id=req.params.id
       

  
    const couponDta=await Coupon.updateOne({_id:id},{$set:{
        code:req.body.code,
        expirationDate:req.body.expirationDate,
        maxDiscount:req.body.maxDiscount,
        MinPurchaceAmount:req.body.MinPurchaceAmount,
        percentageOff:req.body.percentageOff
    }})
 
       res.redirect('/admin/coupons')
    } catch (error) {
       console.log(error.message);
    }
}
//apply coupon
const applyCoupon=async (req,res)=>{
    try {

       //console.log("booooooody"+req.body);
      const couponDetails=await Coupon.findOne({code:req.body.code})
      //console.log(couponDetails);
      if(couponDetails){
      const user=await User.findOne({_id: req.session.user_id})
     // console.log("uuuuuuser"+user);
      
      const found=await Coupon.findOne({code:req.body.code,userUsed: { $in: [user._id] } })
      const code=couponDetails.code
     // console.log("coopon detial"+couponDetails);
      const datenow=Date.now()
    if(found){
        console.log("nadakula");
        res.json({used:true})
    }else{
      if(datenow<=couponDetails.expirationDate){
           if(couponDetails.MinPurchaceAmount<=req.body.total){
            let discountAmount=req.body.total*(couponDetails.percentageOff)/100
            //console.log("diiiiiiiscontamnt"+discountAmount);
           
          
            if(discountAmount<=couponDetails.maxDiscount){
               let  discountValue= discountAmount
             let  value=req.body.total-discountValue
             //console.log("diiiiiscntvalue"+discountValue);
             //console.log("vvvvalue"+value);

                res.json({amountokay:true,value,discountValue,code})
            
            }else{
                let  discountValue=couponDetails.maxDiscount
                let  value=req.body.total-discountValue
                //console.log("else diiiiiscntvalue"+discountValue);
                //console.log("else vvvvalue"+value);
                res.json({amountokay:true,value,discountValue,code})
                // await Coupon.updateOne({code:req.body.code},{$push:{userUsed:user._id}})
            }
      
           }else{
    
            res.json({amountnokay:true})
           }

        
      }else{
   
         res.json({datefailed:true})
      }}}else{
        res.json({invalid:true})
      }
    } catch (error) {
       console.log(error.message);
    }
  }
  
module.exports={
    loadCoupons,
    loadAddCoupon,
    insertCoupon,
    deleteCoupon,
    EditCoupon,
    SaveCoupon,
    applyCoupon




}
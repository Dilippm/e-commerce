const user=require('../models/userData');

const loadUser = async (req, res) => {
    try {
      const userdata = await user.find({});
      res.render('adminuserlist', { userData: userdata });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
 
const blockUser=async(req,res)=>{
  try {
      const id= req.params.id;
      
      const wait = await user.updateOne({_id:id},{$set:{status:true}});
     
      res.redirect('/admin/user');
  } catch (error) {
      console.log(error.message);
  }
}
const unblockuser= async(req,res)=>{
  try {
      const id=req.params.id;
      console.log(id);
      const wait= await user.updateOne({_id:id},{$set:{status:false}});
      console.log(wait);
      res.redirect('/admin/user');
  } catch (error) {
      console.log(error.message);
  }
}
module.exports={
    loadUser,
   
   blockUser,
   unblockuser
}
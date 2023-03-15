
const User = require('../models/userData');
const islogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {


    } else {
      return res.redirect('/login');
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
}

const islogout = async (req, res, next) => {

  try {
    if (req.session.user_id) {
      return res.redirect('/userhome');

    }
    next();

  } catch (error) {
    console.log(error.message);
  }
}
const checkBlockedStatus = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    if (!userId) {
      // If guest user, proceed to requested page
      return next();
    }

    const user = await User.findById(userId);

    if (user.status === true) {
      // If user is blocked, log them out and redirect to login page
      req.session.user_id = null;
      return res.redirect('/login');
    }

    // If user is not blocked, proceed to requested page
    return next();
  } catch (error) {
    console.log(error.message);
    //res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  islogin,
  islogout,
  checkBlockedStatus
}
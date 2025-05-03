const validator = require('validator');

const validateSignup = (req) => {
    const { email, password , mobile} = req.body;

    if (!mobile || mobile.length == 10) {
        return { success: false, message: "First name must be at least 3 characters long" };
    }

    if (!validator.isEmail(email)) {
        return { success: false, message: "Enter a valid email" };
    }

    if (!password || password.length < 8) {
        return { success: false, message: "Password must be at least 8 characters long" };
    }

    return { success: true };
};

module.exports = validateSignup;

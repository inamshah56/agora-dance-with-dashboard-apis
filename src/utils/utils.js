
// =========================== convertToLowercase ===============================

const convertToLowercase = (obj, excludeFields = []) => {
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string' && !excludeFields.includes(key)) {
                newObj[key] = value.toLowerCase();
            } else {
                newObj[key] = value;
            }
        }
    }
    return newObj;
};

// ============================ validateEmail ====================================

const validEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const validateEmail = (email) => {
    if (!email) {
        return "Email is required";
    }
    if (!validEmailRegex.test(email)) {
        return "Please enter a valid email";
    }
};

// ============================ validatePassword =================================

const validatePassword = (password) => {
    if (!password) {
        return "Password is required";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    // Strong password criteria
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        console.log(strongPasswordRegex.test(password));
        console.log("passowrd is not strong");
        return "Password must contain at least one uppercase letter, one numeric digit and one special character.";
    }
};

export { convertToLowercase, validateEmail, validatePassword };


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

// ============================ validatePhone =================================

const validPhoneRegex = /^\+34\d{9}$/;
const validatePhone = (phoneNumber) => {
    if (!phoneNumber) {
        return "Phone number is required";
    }
    if (!phoneNumber.startsWith('+34')) {
        return "The phone number must start with '+34'";
    }
    if (phoneNumber.length !== 12) {
        return "The phone number must be 12 characters long";
    }
    if (!validPhoneRegex.test(phoneNumber)) {
        return "The phone number must follow the format '+34XXXXXXXXX' with exactly 9 digits after '+34'";
    }
};

// ============================ calculateAge =================================

const calculateAge = (dob) => {
    const birthday = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    // If birthday hasn't occurred yet this year, subtract one year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }

    return age;
}

// ============================ getRelativePath =================================

// Helper function to get the relative path from the static base path
const getRelativePath = (fullPath) => {
    const normalizedPath = fullPath.replace(/\\/g, '/');
    const index = normalizedPath.indexOf('/static');
    if (index === -1) return '';
    return normalizedPath.substring(index);
}

// ============================ advertisement helping functions =================================

// Helper function to validate YouTube URLs
const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|user\/|playlist\/|watch\?v=|embed\/|v\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(url);
};

// Helper function to validate Instagram URLs
const validateInstagramUrl = (url) => {
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    return instagramRegex.test(url);
};

// Helper function to validate Spotify URLs
const validateSpotifyUrl = (url) => {
    const spotifyRegex = /^(https?:\/\/)?(www\.)?spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]{22}$/;
    return spotifyRegex.test(url);
};

// ============================ isDateSmallerThanToday =================================

function isDateSmallerThanToday(dateToCheck) {
    // Get today's date
    const today = new Date();

    // Set the time to 00:00:00 to only compare the dates
    today.setHours(0, 0, 0, 0);

    // Create a Date object from the dateToCheck (assuming dateToCheck is a string)
    const date = new Date(dateToCheck);

    // Compare the dates
    return date < today;
}

export { convertToLowercase, validateEmail, validatePassword, validatePhone, calculateAge, getRelativePath, validateYouTubeUrl, validateInstagramUrl, validateSpotifyUrl, isDateSmallerThanToday };

import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import bcrypt from "bcryptjs"

// Define a schema for the user with email and password fields
const User = sequelize.define('user', {
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Makes this field mandatory
        unique: true,  //  // Ensures email addresses are unique in the database
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, // Makes this field mandatory
    },
    first_name: {
        type: DataTypes.STRING,
    },
    last_name: {
        type: DataTypes.STRING,
    },
    age: {
        type: DataTypes.INTEGER,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['male', 'female', 'other']],
                msg: "Gender must be either 'male', 'female', or 'other'."
            }
        },
    },
    otp: {
        type: DataTypes.INTEGER,
    },
    otp_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.ENUM('initial', 'advanced', 'pro'),
        defaultValue: 'initial'
    },
    points: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    fcm_token: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
)

export default User;
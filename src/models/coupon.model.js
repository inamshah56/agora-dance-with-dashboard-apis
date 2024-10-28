import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

const Coupon = sequelize.define('Coupon', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Coupon code already exists." },
        primaryKey: true
    },
    discount_percent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: "Discount percent must be an integer."
            },
            min: {
                args: [1],
                msg: "Discount percent must be at least 1."
            },
            max: {
                args: [100],
                msg: "Discount percent must be at most 100."
            }
        }
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                args: true,
                msg: "Expiry must be a valid date."
            },
            isAfter: {
                args: new Date().toISOString(), // Ensures expiry is in the future
                msg: "Expiry date must be in the future."
            }
        }
    }
});

export default Coupon;

import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import bcrypt from "bcryptjs"

// Event Schema
const Event = sequelize.define('event', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    category: {
        type: DataTypes.ENUM('academy', 'concert', 'congress', 'social'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['academy', 'concert', 'congress', 'social']],
                msg: "Category must be one of the following: academy, concert, congress, or social."
            }
        },
    },
    style: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_tickets: {
        type: DataTypes.INTEGER,
    },
    location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: true,
        defaultValue: null,
    },
    city: {
        type: DataTypes.STRING
    },
    province: {
        type: DataTypes.STRING
    },
    organizer: {
        type: DataTypes.STRING,
    },
    organizer_details: {
        type: DataTypes.TEXT,
    }
}
)

export default Event;
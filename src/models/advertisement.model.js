import sequelize from '../config/dbConfig.js';
import { DataTypes } from 'sequelize';

// Event Food Schema
const Advertisement = sequelize.define('advertisement', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
    },
    youtube_url: {
        type: DataTypes.TEXT
    },
    instagram_url: {
        type: DataTypes.TEXT
    },
    spotify_url: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.TEXT
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

export { Advertisement };
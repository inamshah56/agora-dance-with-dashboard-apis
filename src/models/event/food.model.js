import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import { Event } from './event.model.js';

// Event Food Schema
const Food = sequelize.define('food', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    breakfast_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fullboard_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

export { Food };

// Associations
Event.Food = Event.hasOne(Food, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_food' });
Food.Event = Food.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});


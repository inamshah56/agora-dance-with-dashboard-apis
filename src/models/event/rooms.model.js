import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import { Event } from './event.model.js';

// Event Rooms Schema
const Room = sequelize.define('room', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    bed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price_per_night: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

export { Room };

// Associations
Event.Room = Event.hasMany(Room, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_room' });
Room.Event = Room.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

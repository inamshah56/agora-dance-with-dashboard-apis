import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import { Event } from './event.model.js';

// Event Pass Schema
const Pass = sequelize.define('pass', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    pass_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
});

export { Pass };

// Associations
Event.Pass = Event.hasMany(Pass, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_pass' });
Pass.Event = Pass.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

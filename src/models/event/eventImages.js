// Assuming this is in image.model.js
import sequelize from '../../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import { Event } from './event.model.js';

const EventImages = sequelize.define('event_image', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});
export { EventImages };

// Associations
Event.EventImages = Event.hasMany(EventImages, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_images' });
EventImages.Event = EventImages.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

// Assuming this is in image.model.js
import { DataTypes } from 'sequelize';
import { Event } from './event.model.js';
import { User } from '../user/user.model.js';
import sequelize from '../../config/dbConfig.js';

const FavouriteEvents = sequelize.define('favourite_event', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    }
});
export { FavouriteEvents };

// Associations
User.FavouriteEvents = User.hasMany(FavouriteEvents, { onDelete: 'CASCADE', foreignKey: 'user_uuid', sourceKey: 'uuid', as: 'favourite_events' });
FavouriteEvents.User = FavouriteEvents.belongsTo(User, {
    foreignKey: 'user_uuid', targetKey: 'uuid', as: 'user'
});

Event.FavouriteEvents = Event.hasMany(FavouriteEvents, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'favourite_events' });
FavouriteEvents.Event = FavouriteEvents.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

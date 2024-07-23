import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';
import { User } from './user.model.js';

// Event Schema
const Event = sequelize.define('event', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('academy', 'concert', 'congress', 'social'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['academy', 'concert', 'congress', 'social']],
                msg: "Type must be one of the following: academy, concert, congress, or social."
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
    time: {
        type: DataTypes.TIME,
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
});

// =====================================================================
// =========================== EventImages =============================
// =====================================================================

const EventImages = sequelize.define('event_image', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// =====================================================================
// =========================== FavouriteEvents =========================
// =====================================================================

const FavouriteEvents = sequelize.define('favourite_event', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    }
});

// =====================================================================
// ================================= Pass ==============================
// =====================================================================

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

// =====================================================================
// ================================= Room ==============================
// =====================================================================

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

// =====================================================================
// ================================= Food ==============================
// =====================================================================

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
    allboard_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

export { Event, EventImages, FavouriteEvents, Pass, Room, Food };

// =====================================================================
// ============================ Associations ===========================
// =====================================================================

Event.EventImages = Event.hasMany(EventImages, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_images' });
EventImages.Event = EventImages.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

User.FavouriteEvents = User.hasMany(FavouriteEvents, { onDelete: 'CASCADE', foreignKey: 'user_uuid', sourceKey: 'uuid', as: 'favourite_events' });
FavouriteEvents.User = FavouriteEvents.belongsTo(User, {
    foreignKey: 'user_uuid', targetKey: 'uuid', as: 'user'
});

Event.FavouriteEvents = Event.hasMany(FavouriteEvents, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'favourite_events' });
FavouriteEvents.Event = FavouriteEvents.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

Event.Pass = Event.hasMany(Pass, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_pass' });
Pass.Event = Pass.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

Event.Room = Event.hasMany(Room, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_room' });
Room.Event = Room.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

Event.Food = Event.hasOne(Food, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_food' });
Food.Event = Food.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});
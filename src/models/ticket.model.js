import sequelize from '../config/dbConfig.js';
import { DataTypes } from 'sequelize';
import { User } from './user.model.js';
import { Event, Pass } from './event.model.js';
// import { Pass } from '../event/pass.model.js';

// Event Food Schema
const Ticket = sequelize.define('ticket', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    no_of_nights: {
        type: DataTypes.INTEGER
    },
    no_of_person: {
        type: DataTypes.INTEGER
    },
    no_of_rooms: {
        type: DataTypes.INTEGER
    },
    beds: {
        type: DataTypes.STRING
    },
    food: {
        type: DataTypes.STRING
    },
    total_amount: {
        type: DataTypes.FLOAT
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    order_id: {
        type: DataTypes.STRING
    },
    paid_order_id: {
        type: DataTypes.STRING
    },
    payment_date: {
        type: DataTypes.DATE
    },
    authorization_code: {
        type: DataTypes.STRING
    },
});

const Person = sequelize.define('person', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fname: {
        type: DataTypes.STRING,
    },
    lname: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    nic: {
        type: DataTypes.STRING
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
});

export { Ticket, Person };

// Associations
User.Ticket = User.hasMany(Ticket, { onDelete: 'CASCADE', foreignKey: 'user_uuid', sourceKey: 'uuid', as: 'user_ticket' });
Ticket.User = Ticket.belongsTo(User, {
    foreignKey: 'user_uuid', targetKey: 'uuid', as: 'user'
});

Event.Ticket = Event.hasMany(Ticket, { onDelete: 'CASCADE', foreignKey: 'event_uuid', sourceKey: 'uuid', as: 'event_ticket' });
Ticket.Event = Ticket.belongsTo(Event, {
    foreignKey: 'event_uuid', targetKey: 'uuid', as: 'event'
});

Pass.Ticket = Pass.hasMany(Ticket, { onDelete: 'CASCADE', foreignKey: 'pass_uuid', sourceKey: 'uuid', as: 'pass_ticket' });
Ticket.Pass = Ticket.belongsTo(Pass, {
    foreignKey: 'pass_uuid', targetKey: 'uuid', as: 'pass'
});

Ticket.Person = Ticket.hasMany(Person, { onDelete: 'CASCADE', foreignKey: 'ticket_uuid', sourceKey: 'uuid', as: 'ticket_person' });
Person.Ticket = Person.belongsTo(Ticket, {
    foreignKey: 'ticket_uuid', targetKey: 'uuid', as: 'ticket'
});
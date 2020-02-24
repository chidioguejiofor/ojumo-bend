'use strict';
module.exports = (sequelize, DataTypes) => {
  const RSVP = sequelize.define('RSVP', {
    eventId:{
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'Events',
          key: 'id',
          as: 'event',
        },
        allowNull: false,
      },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
      indexes:[
       {
         unique: true,
         fields:['email', 'eventId'],
       }
      ]
    });
  RSVP.associate = function({Event}) {
    // associations can be defined here
    RSVP.belongsTo(Event, {
      foreignKey: 'eventId',
      as: 'event',
    });
  };
  return RSVP;
};

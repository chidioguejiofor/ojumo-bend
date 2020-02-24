'use strict';
module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define('Event', {
    name: DataTypes.STRING,
    speaker: DataTypes.STRING,
    eventDateTime: DataTypes.DATE
  }, {});
  Events.associate = function({RSVP}) {
    // associations can be defined here
    Events.hasMany(RSVP, {
      foreignKey: 'eventId',
      as: 'rsvp',
    });
  };
  return Events;
};

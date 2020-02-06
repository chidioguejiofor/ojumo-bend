'use strict';
module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define('Event', {
    name: DataTypes.STRING,
    speaker: DataTypes.STRING,
    eventDateTime: DataTypes.DATE
  }, {});
  Events.associate = function(models) {
    // associations can be defined here
  };
  return Events;
};

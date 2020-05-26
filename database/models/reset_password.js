'use strict';

module.exports = (sequelize, DataTypes) => {
  const ResetPassword = sequelize.define(
    'ResetPassword',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userEmail: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {
      timestamps: false
    }
  );

  return ResetPassword;
};

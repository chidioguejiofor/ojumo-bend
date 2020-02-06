'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
       allowNull: false,
       type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  });

  User.associate = ({Article})=>{
     User.hasMany(Article, {
      foreignKey: 'authorId',
      as: 'userArticles',
    });
  };
  return User;

};

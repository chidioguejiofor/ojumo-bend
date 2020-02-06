'use strict';
module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    authorId:{
        type: DataTypes.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      required: true,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  }, {});
  Article.associate = function({User}) {
    // associations can be defined here
     Article.belongsTo(User, {
      foreignKey: 'authorId',
      as: 'author',
    });
  };
  return Article;
};

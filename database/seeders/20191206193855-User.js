'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('users', [{
        name: 'Ezeoke Onyekachi',
        email: 'ezeokesam@gmail.com',
        password: '$2a$10$.8goW29b2lX5MgnBuQVyte6bska9hGRS.20T9eZ1LYV8/91xWECze',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('users', null, {});
  }
};

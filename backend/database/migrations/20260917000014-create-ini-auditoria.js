'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_auditoria')) return;

    await queryInterface.createTable('ini_auditoria', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_rfc: { type: Sequelize.STRING(20), allowNull: false },
      usuario_nombre: { type: Sequelize.STRING(255), allowNull: false },
      accion: { type: Sequelize.STRING(150), allowNull: false },
      registro: { type: Sequelize.STRING(255), allowNull: false },
      resultado: { type: Sequelize.STRING(255), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_auditoria');
  },
};

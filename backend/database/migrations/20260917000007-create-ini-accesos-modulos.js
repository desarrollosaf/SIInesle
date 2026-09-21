'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_accesos_modulos')) return;

    await queryInterface.createTable('ini_accesos_modulos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      rfc: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      modulo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      activo: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ini_accesos_modulos', ['rfc', 'modulo'], {
      name: 'ini_accesos_modulos_rfc_modulo',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_accesos_modulos');
  },
};

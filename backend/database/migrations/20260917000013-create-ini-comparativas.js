'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_comparativas')) return;

    await queryInterface.createTable('ini_comparativas', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      iniciativa_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_iniciativas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pais: { type: Sequelize.STRING(150), allowNull: false },
      estado_region: { type: Sequelize.STRING(150), allowNull: true },
      anio: { type: Sequelize.SMALLINT, allowNull: false },
      nombre_ley: { type: Sequelize.STRING(500), allowNull: false },
      tema: { type: Sequelize.STRING(255), allowNull: true },
      resumen: { type: Sequelize.TEXT, allowNull: true },
      impacto: { type: Sequelize.TEXT, allowNull: true },
      que_funciono: { type: Sequelize.TEXT, allowNull: true },
      que_no_funciono: { type: Sequelize.TEXT, allowNull: true },
      relevancia_edomex: { type: Sequelize.TEXT, allowNull: true },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_comparativas');
  },
};

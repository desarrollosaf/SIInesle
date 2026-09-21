'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_iniciativa_comisiones')) return;

    await queryInterface.createTable('ini_iniciativa_comisiones', {
      iniciativa_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_iniciativas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      comision_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_comisiones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ini_iniciativa_comisiones', {
      fields: ['iniciativa_id', 'comision_id'],
      type: 'primary key',
      name: 'ini_iniciativa_comisiones_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_iniciativa_comisiones');
  },
};

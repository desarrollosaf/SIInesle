'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_iniciativa_partidos')) return;

    await queryInterface.createTable('ini_iniciativa_partidos', {
      iniciativa_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_iniciativas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      partido_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_partidos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ini_iniciativa_partidos', {
      fields: ['iniciativa_id', 'partido_id'],
      type: 'primary key',
      name: 'ini_iniciativa_partidos_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_iniciativa_partidos');
  },
};

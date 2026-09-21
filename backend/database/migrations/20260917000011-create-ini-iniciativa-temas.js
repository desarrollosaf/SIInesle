'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_iniciativa_temas')) return;

    await queryInterface.createTable('ini_iniciativa_temas', {
      iniciativa_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_iniciativas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tema_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_temas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ini_iniciativa_temas', {
      fields: ['iniciativa_id', 'tema_id'],
      type: 'primary key',
      name: 'ini_iniciativa_temas_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_iniciativa_temas');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_iniciativa_legisladores')) return;

    await queryInterface.createTable('ini_iniciativa_legisladores', {
      iniciativa_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_iniciativas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      legislador_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'ini_legisladores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ini_iniciativa_legisladores', {
      fields: ['iniciativa_id', 'legislador_id'],
      type: 'primary key',
      name: 'ini_iniciativa_legisladores_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ini_iniciativa_legisladores');
  },
};

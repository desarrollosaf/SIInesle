'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    if (tablas.includes('ini_iniciativas')) return;

    await queryInterface.createTable('ini_iniciativas', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero: {
        type: Sequelize.STRING(12),
        allowNull: false,
        unique: true,
      },
      fecha_presentacion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      legislatura_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'ini_legislaturas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      titulo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      subtema: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      resumen: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estatus_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'ini_estatus', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      enlace: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      palabras_clave: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nivel_viabilidad_tecnica: {
        type: Sequelize.ENUM('Alta', 'Media', 'Baja'),
        allowNull: true,
      },
      nivel_viabilidad_juridica: {
        type: Sequelize.ENUM('Alta', 'Media', 'Baja'),
        allowNull: true,
      },
      problema: { type: Sequelize.TEXT, allowNull: true },
      objetivo: { type: Sequelize.TEXT, allowNull: true },
      resumen_general: { type: Sequelize.TEXT, allowNull: true },
      beneficios: { type: Sequelize.TEXT, allowNull: true },
      riesgos: { type: Sequelize.TEXT, allowNull: true },
      justificacion_tecnica: { type: Sequelize.TEXT, allowNull: true },
      justificacion_juridica: { type: Sequelize.TEXT, allowNull: true },
      que_funcionaria: { type: Sequelize.TEXT, allowNull: true },
      que_podria_fracasar: { type: Sequelize.TEXT, allowNull: true },
      recomendacion: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.dropTable('ini_iniciativas');
  },
};

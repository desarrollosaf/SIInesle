'use strict';

// Valores base tomados del mockup funcional (defaultCatalogs) para que el
// sistema arranque con los mismos catálogos que ya se usan en la captura.

const legisladores = [
  'AYUNTAMIENTO PROMOVENTE', 'DIP. ELIZABETH MILLÁN GARCÍA', 'DIP. JOANNA ALEJANDRA FELIPE TORRES',
  'DIP. MARÍA DEL CARMEN DE LA ROSA MENDOZA', 'DIP. NAZARIO GUTIÉRREZ MARTÍNEZ', 'DIP. PAOLA JIMÉNEZ HERNÁNDEZ',
  'GRUPO PARLAMENTARIO DE MC', 'GRUPO PARLAMENTARIO DE MORENA', 'GRUPO PARLAMENTARIO DEL PVEM',
  'INICIATIVA CIUDADANA', 'JUNTA DE COORDINACIÓN POLÍTICA', 'TITULAR DEL PODER EJECUTIVO DEL ESTADO',
];

const partidos = ['morena', 'PVEM', 'PAN', 'MC', 'PRI', 'PRD', 'PT', 'JUCOPO', 'Ciudadanía/ONGs', 'Varios'];

const temas = [
  'Seguridad y justicia', 'Derechos humanos e inclusión', 'Medio ambiente y recursos naturales',
  'Niñez, juventud y familia', 'Cultura, deporte y patrimonio', 'Gobierno y administración pública',
  'Reforma política y legislativa', 'Desarrollo económico, finanzas y trabajo',
  'Igualdad de género y derechos de las mujeres', 'Educación', 'Salud pública',
  'Movilidad, vivienda y desarrollo urbano', 'Bienestar animal', 'Transparencia y anticorrupción',
];

const legislaturas = ['LXIII (2024-2027)', 'LXII (2021-2024)', 'LXI (2018-2021)', 'LX (2015-2018)'];

const comisiones = [
  'Gobernación y Puntos Constitucionales', 'Procuración y Administración de Justicia',
  'Planeación y Gasto Público', 'Finanzas Públicas', 'Protección Ambiental y Cambio Climático',
  'Legislación y Administración Municipal', 'Educación, Cultura, Ciencia y Tecnología',
  'Comunicaciones y Transportes',
  'Transparencia, Acceso a la Información Pública, Protección de Datos Personales y de Combate a la Corrupción',
];

const estatus = ['En estudio', 'Aprobada', 'Precluida', 'Desechada', 'Turnada', 'Borrador'];

function filas(valores) {
  const ahora = new Date();
  return valores.map((nombre) => ({
    nombre,
    status: 1,
    created_at: ahora,
    updated_at: ahora,
  }));
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tablas = [
      ['ini_legisladores', legisladores],
      ['ini_partidos', partidos],
      ['ini_temas', temas],
      ['ini_legislaturas', legislaturas],
      ['ini_comisiones', comisiones],
      ['ini_estatus', estatus],
    ];

    for (const [tabla, valores] of tablas) {
      const filasExistentes = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as total FROM \`${tabla}\``,
        { type: Sequelize.QueryTypes.SELECT },
      );
      if (Number(filasExistentes[0].total) > 0) continue;
      await queryInterface.bulkInsert(tabla, filas(valores));
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ini_legisladores', null, {});
    await queryInterface.bulkDelete('ini_partidos', null, {});
    await queryInterface.bulkDelete('ini_temas', null, {});
    await queryInterface.bulkDelete('ini_legislaturas', null, {});
    await queryInterface.bulkDelete('ini_comisiones', null, {});
    await queryInterface.bulkDelete('ini_estatus', null, {});
  },
};

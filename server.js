#!/usr/bin/env node

// Ini adalah file start untuk Render.com
// File ini memanggil index.js di folder src

// Import Sequelize dan model
const { sequelize } = require('./src/models');

// Fungsi untuk melakukan migrasi database otomatis
async function syncDatabase() {
  try {
    console.log('Menjalankan sinkronisasi database...');
    
    // Sync all defined models to the DB with { force: false }
    // force: true akan menghapus dan membuat ulang tabel (JANGAN gunakan di production!)
    await sequelize.sync({ alter: true });
    
    console.log('Sinkronisasi database selesai!');
    
    // Mulai aplikasi setelah sinkronisasi selesai
    require('./src/index.js');
  } catch (error) {
    console.error('Terjadi kesalahan saat sinkronisasi database:', error);
    process.exit(1);
  }
}

// Jalankan sinkronisasi database
syncDatabase();

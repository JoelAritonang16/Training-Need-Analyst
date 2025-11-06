import { Divisi } from '../models/index.js';

const divisiData = [
  'Satuan Pengawasan Intern',
  'Sekretariat Perusahaan',
  'Transformation Management Office',
  'Perencanaan dan Pengelolaan SDM',
  'Layanan SDM dan HSSE',
  'Anggaran, Akuntansi, dan Pelaporan',
  'Pengelolaan Keuangan, dan Perpajakan',
  'Manajemen Risiko',
  'Perencanaan Strategis',
  'Kerjasama Usaha dan Pembinaan Anak Perusahaan',
  'Komersial dan Hubungan Pelanggan',
  'Pengelolaan Operasi',
  'Perencanaan dan Pengembangan Operasi',
  'Sistem Manajemen',
  'Peralatan Pelabuhan',
  'Fasilitas Pelabuhan',
  'Teknologi Informasi'
];

const seedDivisi = async () => {
  try {
    console.log('=== SEEDING DIVISI ===');
    
    // Get existing divisi
    const existingDivisi = await Divisi.findAll();
    const existingNames = existingDivisi.map(d => d.nama);
    
    console.log(`Found ${existingDivisi.length} existing divisi`);
    
    // Create only missing divisi
    const createdDivisi = [];
    const skippedDivisi = [];
    
    for (const divisiName of divisiData) {
      try {
        if (existingNames.includes(divisiName)) {
          console.log(`Divisi already exists: ${divisiName}`);
          skippedDivisi.push(divisiName);
          continue;
        }
        
        const divisi = await Divisi.create({
          nama: divisiName
        });
        createdDivisi.push(divisi);
        console.log(`✓ Created divisi: ${divisiName}`);
      } catch (error) {
        console.error(`✗ Failed to create divisi ${divisiName}:`, error.message);
      }
    }
    
    console.log(`=== DIVISI SEEDING COMPLETED ===`);
    console.log(`Successfully created ${createdDivisi.length} new divisi`);
    console.log(`Skipped ${skippedDivisi.length} existing divisi`);
    
    return {
      success: true,
      message: 'Divisi seeding completed',
      count: createdDivisi.length,
      skipped: skippedDivisi.length,
      total: existingDivisi.length + createdDivisi.length,
      divisi: createdDivisi
    };
    
  } catch (error) {
    console.error('Divisi seeding error:', error);
    return {
      success: false,
      message: 'Failed to seed divisi',
      error: error.message
    };
  }
};

export default seedDivisi;

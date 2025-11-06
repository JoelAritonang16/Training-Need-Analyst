import { Branch } from '../models/index.js';

const branchData = [
  'Tanjung Pinang',
  'Tanjung Balai Karimun',
  'Tanjung Intan',
  'Jamiriah',
  'Trisakti_mekar Putih',
  'Bumiharjo Bagendang',
  'Benoa',
  'Balikpapan',
  'Dumai',
  'Belawan',
  'Lembar',
  'Teluk Lamong',
  'Gresik',
  'Tanjung Emas',
  'Makassar',
  'Pareoare_Garongkong',
  'Sibolga',
  'Malahayati',
  'Lhokseumawe',
  'Badas_Bima'
];

const seedBranches = async () => {
  try {
    console.log('=== SEEDING BRANCHES ===');
    
    // Get existing branches
    const existingBranches = await Branch.findAll();
    const existingNames = existingBranches.map(b => b.nama);
    
    console.log(`Found ${existingBranches.length} existing branches`);
    
    // Create only missing branches
    const createdBranches = [];
    const skippedBranches = [];
    
    for (const branchName of branchData) {
      try {
        if (existingNames.includes(branchName)) {
          console.log(`Branch already exists: ${branchName}`);
          skippedBranches.push(branchName);
          continue;
        }
        
        const branch = await Branch.create({
          nama: branchName
        });
        createdBranches.push(branch);
        console.log(`✓ Created branch: ${branchName}`);
      } catch (error) {
        console.error(`✗ Failed to create branch ${branchName}:`, error.message);
      }
    }
    
    console.log(`=== BRANCH SEEDING COMPLETED ===`);
    console.log(`Successfully created ${createdBranches.length} new branches`);
    console.log(`Skipped ${skippedBranches.length} existing branches`);
    
    return {
      success: true,
      message: 'Branch seeding completed',
      count: createdBranches.length,
      skipped: skippedBranches.length,
      total: existingBranches.length + createdBranches.length,
      branches: createdBranches
    };
    
  } catch (error) {
    console.error('Branch seeding error:', error);
    return {
      success: false,
      message: 'Failed to seed branches',
      error: error.message
    };
  }
};

export default seedBranches;

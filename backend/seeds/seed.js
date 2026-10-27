import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';

const sampleUsers = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@chitkara.edu.in',
    password: 'password123',
    role: 'student',
  },
  {
    name: 'Priyanka Verma',
    email: 'priyanka.verma@chitkara.edu.in',
    password: 'password123',
    role: 'student',
  },
  {
    name: 'Campus Security Desk',
    email: 'security.desk@chitkara.edu.in',
    password: 'adminpassword123',
    role: 'admin',
  },
];

const sampleItems = [
  {
    type: 'lost',
    title: 'Blue Hydro Flask Water Bottle',
    category: 'Other',
    description: 'Dark blue 750ml insulated metal bottle with Chitkara stickers on the bottom rim.',
    location: 'Cafeteria',
    date: '2026-10-24',
    image: '',
    status: 'Open',
  },
  {
    type: 'found',
    title: 'Apple AirPods Pro in White Case',
    category: 'Electronics',
    description: 'Found on a 2nd floor library study table near the computer lab. Has a tiny scratch near the LED.',
    location: 'Library',
    date: '2026-10-25',
    image: '',
    status: 'Open',
  },
  {
    type: 'lost',
    title: 'Engineering Mathematics Textbook (Vol. 2)',
    category: 'Books',
    description: 'Standard textbook with handwritten formula notes in pencil on page 112.',
    location: 'Block A',
    date: '2026-10-22',
    image: '',
    status: 'Open',
  },
  {
    type: 'found',
    title: 'Student ID Card — CSE Department',
    category: 'Documents',
    description: 'Found near the main security turnstiles entrance. Handed over to lost & found desk.',
    location: 'Main Gate',
    date: '2026-10-26',
    image: '',
    status: 'Open',
  },
  {
    type: 'lost',
    title: 'Black HP Laptop Charger (65W)',
    category: 'Electronics',
    description: '65W USB-C barrel adapter forgotten near power socket 4 in Auditorium Block B.',
    location: 'Auditorium',
    date: '2026-10-21',
    image: '',
    status: 'Claimed',
  },
  {
    type: 'found',
    title: 'Set of 3 Keys with Batman Keychain',
    category: 'Keys',
    description: 'Two brass keys and one bike key on a black metal Batman emblem keychain found near basketball court.',
    location: 'Sports Complex',
    date: '2026-10-26',
    image: '',
    status: 'Open',
  },
];

async function seedDatabase() {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

    // Clear existing collections
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    console.log('[Seed] Cleared existing users, items, and claims collections.');

    // Insert sample users
    const createdUsers = await User.create(sampleUsers);
    console.log(`[Seed] Inserted ${createdUsers.length} users into 'users' collection.`);

    // Insert sample items linked to users
    const itemsToInsert = sampleItems.map((item, idx) => ({
      ...item,
      createdBy: createdUsers[idx % createdUsers.length]._id,
    }));
    const createdItems = await Item.insertMany(itemsToInsert);
    console.log(`[Seed] Inserted ${createdItems.length} items into 'items' collection.`);

    // Create a sample claim on the Claimed item
    const claimedItem = createdItems.find((it) => it.status === 'Claimed');
    if (claimedItem) {
      const sampleClaim = await Claim.create({
        item: claimedItem._id,
        claimant: createdUsers[0]._id,
        claimType: 'ownership_claim',
        status: 'Approved',
        verificationAnswers: {
          itemColor: 'Black',
          uniqueFeature: 'Chipped cable strain relief near barrel plug',
          lostLocation: 'Auditorium Block B, row 4',
          contactName: 'Rohit Gupta',
        },
        reviewNotes: 'Verified with student ID card.',
      });
      console.log(`[Seed] Inserted sample claim for item: ${claimedItem.title} (Claim ID: ${sampleClaim._id})`);
    }

    console.log('\n======================================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Collections created: users (${createdUsers.length}), items (${createdItems.length}), claims (1)`);
    console.log(`   Compass URI: ${MONGODB_URI}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();

const mongoose = require('mongoose');

// Create indexes for better query performance
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // User collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Lead collection indexes
    await db.collection('leads').createIndex({ partnerId: 1 });
    await db.collection('leads').createIndex({ status: 1 });
    await db.collection('leads').createIndex({ createdAt: -1 });
    await db.collection('leads').createIndex({ email: 1 });

    // Commission collection indexes
    await db.collection('commissions').createIndex({ userId: 1 });
    await db.collection('commissions').createIndex({ status: 1 });
    await db.collection('commissions').createIndex({ createdAt: -1 });

    // Payment collection indexes
    await db.collection('paymentrequests').createIndex({ userId: 1 });
    await db.collection('paymentrequests').createIndex({ status: 1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = createIndexes;
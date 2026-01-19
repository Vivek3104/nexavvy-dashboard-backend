const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Lead = require('../models/Lead');
const connectDB = require('../config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Lead.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Create demo users
        const partner1 = await User.create({
            name: 'Amit Patel',
            email: 'partner@demo.com',
            password: 'partner123',
            role: 'partner',
            phone: '9876543210',
        });

        const partner2 = await User.create({
            name: 'Sneha Gupta',
            email: 'sneha@demo.com',
            password: 'partner123',
            role: 'partner',
            phone: '9123456789',
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@demo.com',
            password: 'admin123',
            role: 'admin',
            phone: '9999999999',
        });

        console.log('✅ Created demo users');

        // Create demo leads
        const leads = [
            {
                partnerId: partner1._id,
                name: 'Rajesh Kumar',
                mobile: '9876543210',
                email: 'rajesh@kumar.com',
                city: 'Mumbai',
                businessName: 'Kumar Enterprises',
                businessType: 'retail',
                website: 'https://kumarenterprises.com',
                productServices: 'Electronics retail and wholesale distribution',
                status: 'converted',
                activeClient: true,
            },
            {
                partnerId: partner1._id,
                name: 'Priya Sharma',
                mobile: '9123456789',
                email: 'priya@sharmatextiles.com',
                city: 'Delhi',
                businessName: 'Sharma Textiles',
                businessType: 'manufacturing',
                website: '',
                productServices: 'Textile manufacturing and export',
                status: 'contacted',
                activeClient: false,
            },
            {
                partnerId: partner1._id,
                name: 'Vikram Singh',
                mobile: '9988776655',
                email: 'vikram@singhjewellers.com',
                city: 'Jaipur',
                businessName: 'Singh Jewellers',
                businessType: 'retail',
                website: 'https://singhjewellers.in',
                productServices: 'Gold and diamond jewellery',
                status: 'converted',
                activeClient: true,
            },
            {
                partnerId: partner2._id,
                name: 'Meera Reddy',
                mobile: '9876512345',
                email: 'meera@reddyfoods.com',
                city: 'Hyderabad',
                businessName: 'Reddy Foods',
                businessType: 'food-beverage',
                website: '',
                productServices: 'Organic food products and distribution',
                status: 'pending',
                activeClient: false,
            },
            {
                partnerId: partner2._id,
                name: 'Arjun Mehta',
                mobile: '9123498765',
                email: 'arjun@mehtatech.com',
                city: 'Bangalore',
                businessName: 'Mehta Tech Solutions',
                businessType: 'technology',
                website: 'https://mehtatech.com',
                productServices: 'IT consulting and software development',
                status: 'contacted',
                activeClient: false,
            },
            {
                partnerId: partner1._id,
                name: 'Kavita Joshi',
                mobile: '9988123456',
                email: 'kavita@joshipharma.com',
                city: 'Pune',
                businessName: 'Joshi Pharmaceuticals',
                businessType: 'healthcare',
                website: '',
                productServices: 'Generic medicines distribution',
                status: 'rejected',
                activeClient: false,
            },
            {
                partnerId: partner2._id,
                name: 'Rahul Verma',
                mobile: '9876598765',
                email: 'rahul@vermaproperties.com',
                city: 'Noida',
                businessName: 'Verma Properties',
                businessType: 'real-estate',
                website: 'https://vermaproperties.in',
                productServices: 'Real estate development and sales',
                status: 'converted',
                activeClient: true,
            },
            {
                partnerId: partner1._id,
                name: 'Anita Desai',
                mobile: '9123412345',
                email: 'anita@desaiedu.com',
                city: 'Chennai',
                businessName: 'Desai Education Hub',
                businessType: 'education',
                website: '',
                productServices: 'Coaching classes and online education',
                status: 'pending',
                activeClient: false,
            },
            {
                partnerId: partner2._id,
                name: 'Suresh Nair',
                mobile: '9988998899',
                email: 'suresh@nairhospitality.com',
                city: 'Kochi',
                businessName: 'Nair Hospitality',
                businessType: 'hospitality',
                website: 'https://nairhospitality.com',
                productServices: 'Hotel and restaurant chain',
                status: 'converted',
                activeClient: true,
            },
            {
                partnerId: partner1._id,
                name: 'Deepak Agarwal',
                mobile: '9876587654',
                email: 'deepak@agarwaltrading.com',
                city: 'Kolkata',
                businessName: 'Agarwal Trading Co.',
                businessType: 'retail',
                website: '',
                productServices: 'Import-export and wholesale trading',
                status: 'contacted',
                activeClient: false,
            },
        ];

        await Lead.insertMany(leads);

        console.log('✅ Created demo leads');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Leads: ${await Lead.countDocuments()}`);
        console.log('\n🔐 Demo Credentials:');
        console.log('   Partner: partner@demo.com / partner123');
        console.log('   Admin: admin@demo.com / admin123');
        console.log('\n✨ Database seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Labour = require('./models/Labour');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khoojlocal');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Labour.deleteMany({});

    // Create Admin Account
    console.log('👤 Creating admin account...');
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@khoojlocal.com',
      password: 'admin123', // Password will be hashed automatically
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin created:', admin.email);

    // Create Sample Users
    console.log('👥 Creating sample users...');
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user',
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '0987654321',
        role: 'user',
        isActive: true,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        phone: '5555555555',
        role: 'user',
        isActive: true,
      },
    ]);
    console.log(`✅ ${users.length} users created`);

    // Create Sample Vendors
    console.log('🏪 Creating sample vendors...');
    const vendors = await Vendor.insertMany([
      {
        businessName: 'The Gourmet Kitchen',
        ownerName: 'Sarah Williams',
        email: 'sarah@gourmetkitchen.com',
        password: 'vendor123',
        phone: '1112223333',
        category: 'Restaurant',
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
        },
        description: 'Fine dining restaurant with locally sourced ingredients',
        images: {
          logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
          banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          ],
        },
        services: ['Lunch Service', 'Dinner Service', 'Catering'],
        businessHours: {
          monday: { open: '11:00', close: '22:00', isClosed: false },
          tuesday: { open: '11:00', close: '22:00', isClosed: false },
          wednesday: { open: '11:00', close: '22:00', isClosed: false },
          thursday: { open: '11:00', close: '22:00', isClosed: false },
          friday: { open: '11:00', close: '23:00', isClosed: false },
          saturday: { open: '10:00', close: '23:00', isClosed: false },
          sunday: { open: '10:00', close: '21:00', isClosed: false },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.5,
        totalReviews: 128,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'both',
      },
      {
        businessName: 'Fitness First Gym',
        ownerName: 'Mike Thompson',
        email: 'mike@fitnessfirst.com',
        password: 'vendor123',
        phone: '4445556666',
        category: 'Gym',
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          country: 'USA',
        },
        description: 'Modern gym with state-of-the-art equipment and personal trainers',
        images: {
          logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
          banner: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          ],
        },
        services: ['Monthly Membership', 'Personal Training', 'Group Classes', 'Yoga'],
        businessHours: {
          monday: { open: '05:00', close: '22:00', isClosed: false },
          tuesday: { open: '05:00', close: '22:00', isClosed: false },
          wednesday: { open: '05:00', close: '22:00', isClosed: false },
          thursday: { open: '05:00', close: '22:00', isClosed: false },
          friday: { open: '05:00', close: '20:00', isClosed: false },
          saturday: { open: '07:00', close: '18:00', isClosed: false },
          sunday: { open: '08:00', close: '16:00', isClosed: false },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.8,
        totalReviews: 95,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'booking',
      },
      {
        businessName: 'Bella Hair Salon',
        ownerName: 'Emily Rodriguez',
        email: 'emily@bellahair.com',
        password: 'vendor123',
        phone: '7778889999',
        category: 'Salon',
        address: {
          street: '789 Elm Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          country: 'USA',
        },
        description: 'Premium hair salon and spa services',
        images: {
          logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
          banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
            'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400',
          ],
        },
        services: ['Haircut & Style', 'Hair Coloring', 'Spa Treatment', 'Manicure'],
        businessHours: {
          monday: { open: '09:00', close: '18:00', isClosed: false },
          tuesday: { open: '09:00', close: '18:00', isClosed: false },
          wednesday: { open: '09:00', close: '18:00', isClosed: false },
          thursday: { open: '09:00', close: '19:00', isClosed: false },
          friday: { open: '09:00', close: '19:00', isClosed: false },
          saturday: { open: '08:00', close: '17:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.7,
        totalReviews: 76,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'booking',
      },
      {
        businessName: 'Sweet Delights Bakery',
        ownerName: 'Maria Santos',
        email: 'maria@sweetdelights.com',
        password: 'vendor123',
        phone: '1231231234',
        category: 'Bakery',
        address: {
          street: '100 Baker Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62709',
          country: 'USA',
        },
        description: 'Fresh breads, pastries, and custom cakes made daily',
        images: {
          logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
          banner: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400',
            'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400',
          ],
        },
        services: ['Fresh Bread', 'Custom Cakes', 'Pastries', 'Wedding Cakes', 'Catering'],
        businessHours: {
          monday: { open: '06:00', close: '19:00', isClosed: false },
          tuesday: { open: '06:00', close: '19:00', isClosed: false },
          wednesday: { open: '06:00', close: '19:00', isClosed: false },
          thursday: { open: '06:00', close: '19:00', isClosed: false },
          friday: { open: '06:00', close: '20:00', isClosed: false },
          saturday: { open: '07:00', close: '20:00', isClosed: false },
          sunday: { open: '07:00', close: '17:00', isClosed: false },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.7,
        totalReviews: 156,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'both',
      },
      {
        businessName: 'Artisan Bread Co',
        ownerName: 'Thomas Baker',
        email: 'thomas@artisanbread.com',
        password: 'vendor123',
        phone: '3213213211',
        category: 'Bakery',
        address: {
          street: '456 Flour Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62710',
          country: 'USA',
        },
        description: 'Handcrafted artisan breads and European pastries',
        images: {
          logo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
          banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400',
            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
          ],
        },
        services: ['Sourdough Bread', 'Croissants', 'Danish Pastries', 'Baguettes', 'Wholesale'],
        businessHours: {
          monday: { open: '07:00', close: '18:00', isClosed: false },
          tuesday: { open: '07:00', close: '18:00', isClosed: false },
          wednesday: { open: '07:00', close: '18:00', isClosed: false },
          thursday: { open: '07:00', close: '18:00', isClosed: false },
          friday: { open: '07:00', close: '18:00', isClosed: false },
          saturday: { open: '07:00', close: '17:00', isClosed: false },
          sunday: { open: '08:00', close: '15:00', isClosed: false },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.8,
        totalReviews: 112,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'ordering',
      },
      {
        businessName: 'Tech Repair Pro',
        ownerName: 'David Chen',
        email: 'david@techrepair.com',
        password: 'vendor123',
        phone: '2223334444',
        category: 'Other',
        address: {
          street: '321 Tech Boulevard',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          country: 'USA',
        },
        description: 'Expert computer and phone repair services',
        images: {
          logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
          banner: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
          gallery: [],
        },
        services: ['Phone Screen Repair', 'Computer Diagnostics', 'Data Recovery', 'Virus Removal'],
        businessHours: {
          monday: { open: '10:00', close: '18:00', isClosed: false },
          tuesday: { open: '10:00', close: '18:00', isClosed: false },
          wednesday: { open: '10:00', close: '18:00', isClosed: false },
          thursday: { open: '10:00', close: '18:00', isClosed: false },
          friday: { open: '10:00', close: '18:00', isClosed: false },
          saturday: { open: '11:00', close: '15:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true },
        },
        status: 'Pending',
        isActive: true,
        rating: 0,
        totalReviews: 0,
        serviceType: 'booking',
      },
      {
        businessName: 'Spice Garden Restaurant',
        ownerName: 'Priya Patel',
        email: 'priya@spicegarden.com',
        password: 'vendor123',
        phone: '3334445555',
        category: 'Restaurant',
        address: {
          street: '555 Curry Lane',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62705',
          country: 'USA',
        },
        description: 'Authentic Indian cuisine with vegetarian and vegan options',
        images: {
          logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
          banner: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
            'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
          ],
        },
        services: ['Dine-in', 'Takeout', 'Delivery', 'Party Catering', 'Buffet'],
        businessHours: {
          monday: { open: '11:30', close: '22:00', isClosed: false },
          tuesday: { open: '11:30', close: '22:00', isClosed: false },
          wednesday: { open: '11:30', close: '22:00', isClosed: false },
          thursday: { open: '11:30', close: '22:00', isClosed: false },
          friday: { open: '11:30', close: '23:00', isClosed: false },
          saturday: { open: '11:30', close: '23:00', isClosed: false },
          sunday: { open: '12:00', close: '21:00', isClosed: false },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.6,
        totalReviews: 142,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'both',
      },
      {
        businessName: 'Downtown Dental Care',
        ownerName: 'Dr. Robert Martinez',
        email: 'robert@downtowndental.com',
        password: 'vendor123',
        phone: '6667778888',
        category: 'Other',
        address: {
          street: '888 Medical Plaza',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62706',
          country: 'USA',
        },
        description: 'Complete dental care with advanced technology and experienced staff',
        images: {
          logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
          banner: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400',
            'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400',
          ],
        },
        services: ['Routine Checkup', 'Teeth Cleaning', 'Fillings', 'Root Canal', 'Teeth Whitening', 'Orthodontics'],
        businessHours: {
          monday: { open: '08:00', close: '17:00', isClosed: false },
          tuesday: { open: '08:00', close: '17:00', isClosed: false },
          wednesday: { open: '08:00', close: '17:00', isClosed: false },
          thursday: { open: '08:00', close: '19:00', isClosed: false },
          friday: { open: '08:00', close: '15:00', isClosed: false },
          saturday: { open: '09:00', close: '13:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.9,
        totalReviews: 203,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'booking',
      },
      {
        businessName: 'Pet Paradise Grooming',
        ownerName: 'Jessica Taylor',
        email: 'jessica@petparadise.com',
        password: 'vendor123',
        phone: '9990001111',
        category: 'Other',
        address: {
          street: '222 Paws Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62707',
          country: 'USA',
        },
        description: 'Professional pet grooming services for dogs and cats',
        images: {
          logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
          banner: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
          gallery: [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
            'https://images.unsplash.com/photo-1581888227599-779811939961?w=400',
          ],
        },
        services: ['Bath & Brush', 'Full Grooming', 'Nail Trimming', 'Ear Cleaning', 'Teeth Brushing'],
        businessHours: {
          monday: { open: '09:00', close: '18:00', isClosed: false },
          tuesday: { open: '09:00', close: '18:00', isClosed: false },
          wednesday: { open: '09:00', close: '18:00', isClosed: false },
          thursday: { open: '09:00', close: '18:00', isClosed: false },
          friday: { open: '09:00', close: '18:00', isClosed: false },
          saturday: { open: '10:00', close: '16:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true },
        },
        status: 'Approved',
        isActive: true,
        rating: 4.8,
        totalReviews: 87,
        approvedAt: new Date(),
        approvedBy: admin._id,
        serviceType: 'booking',
      },
      {
        businessName: 'Elite Auto Repair',
        ownerName: 'James Wilson',
        email: 'james@eliteauto.com',
        password: 'vendor123',
        phone: '5554443333',
        category: 'Other',
        address: {
          street: '777 Garage Road',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62708',
          country: 'USA',
        },
        description: 'Full-service auto repair shop with certified mechanics',
        images: {
          logo: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
          banner: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
          gallery: [],
        },
        services: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics', 'AC Repair', 'Transmission Service'],
        businessHours: {
          monday: { open: '07:00', close: '18:00', isClosed: false },
          tuesday: { open: '07:00', close: '18:00', isClosed: false },
          wednesday: { open: '07:00', close: '18:00', isClosed: false },
          thursday: { open: '07:00', close: '18:00', isClosed: false },
          friday: { open: '07:00', close: '18:00', isClosed: false },
          saturday: { open: '08:00', close: '14:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true },
        },
        status: 'Pending',
        isActive: true,
        rating: 0,
        totalReviews: 0,
        serviceType: 'booking',
      },
    ]);

    // Create Sample Labour Workers
    console.log('👷 Creating sample labour workers...');
    
    // Labour workers now have their own email/password (no longer need user accounts)
    const labourWorkers = await Labour.insertMany([
      {
        fullName: 'Mazdoor',
        email: 'mazdoor@gmail.com',
        password: '11221122',
        phone: '3001112222',
        cnicNumber: '35201-1234567-1',
        skill: 'Driver',
        experience: 4,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '8am - 6pm',
        },
        bio: 'Professional driver with experience in local and intercity routes.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 20,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.5,
        totalReviews: 18,
        verifiedAt: new Date(),
      },
      {
        fullName: 'Ahmed Khan',
        email: 'ahmed.plumber@khoojlocal.com',
        password: 'labour123',
        phone: '3001234567',
        cnicNumber: '35202-1234567-1',
        skill: 'Plumber',
        experience: 8,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: '9am - 5pm',
        },
        bio: 'Professional plumber specializing in pipe installation, repairs, and maintenance.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 20,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.7,
        totalReviews: 34,
        verifiedAt: new Date(),
      },
      {
        fullName: 'Hassan Ali',
        email: 'hassan.electrician@khoojlocal.com',
        password: 'labour123',
        phone: '3009876543',
        cnicNumber: '35202-1234567-2',
        skill: 'Electrician',
        experience: 10,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: '8am - 6pm',
        },
        bio: 'Certified electrician for all types of electrical work and repairs. Licensed electrician with expertise in wiring and electrical installations.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 20,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.9,
        totalReviews: 56,
      },
      {
        fullName: 'Bilal Mahmood',
        email: 'bilal.carpenter@khoojlocal.com',
        password: 'labour123',
        phone: '3005551234',
        cnicNumber: '35202-1234567-3',
        skill: 'Carpenter',
        experience: 6,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '9am - 5pm',
        },
        bio: 'Expert carpenter for custom furniture and home woodwork projects. Skilled carpenter specializing in furniture making and woodwork.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 10,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.6,
        totalReviews: 28,
      },
      {
        fullName: 'Tariq Hussain',
        email: 'tariq.painter@khoojlocal.com',
        password: 'labour123',
        phone: '3007778888',
        cnicNumber: '35202-1234567-4',
        skill: 'Painter',
        experience: 5,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: '8am - 4pm',
        },
        bio: 'Quality painting services for homes and commercial spaces. Professional painter for interior and exterior painting services.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 12,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.5,
        totalReviews: 22,
        verifiedAt: new Date(),
      },
      {
        fullName: 'Rashid Malik',
        email: 'rashid.mason@khoojlocal.com',
        password: 'labour123',
        phone: '3004443333',
        cnicNumber: '35202-1234567-5',
        skill: 'Mason',
        experience: 12,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: '7am - 5pm',
        },
        bio: 'Master mason with extensive experience in residential and commercial construction. Experienced mason for construction and brick work.',
        documents: {
          cnicFront: '/uploads/labour/cnic/sample-front.jpg',
          cnicBack: '/uploads/labour/cnic/sample-back.jpg',
          selfie: '/uploads/labour/selfie/sample-selfie.jpg',
        },
        serviceArea: {
          type: 'Point',
          coordinates: [73.0479, 33.6844],
          latitude: 33.6844,
          longitude: 73.0479,
          address: 'Islamabad, Pakistan',
          radius: 25,
        },
        verificationStatus: 'approved',
        isApproved: true,
        rating: 4.8,
        totalReviews: 45,
        verifiedAt: new Date(),
      },
    ]);
    console.log(`✅ ${labourWorkers.length} labour workers created`);

    console.log('\n📊 DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('\n👨‍💼 ADMIN LOGIN:');
    console.log('   Email: admin@khoojlocal.com');
    console.log('   Password: admin123');
    console.log('\n👤 SAMPLE USER LOGIN:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('\n🏪 APPROVED VENDORS (8):');
    console.log('   - The Gourmet Kitchen (Restaurant)');
    console.log('   - Fitness First Gym (Gym)');
    console.log('   - Bella Hair Salon (Salon)');
    console.log('   - Spice Garden Restaurant (Restaurant)');
    console.log('   - Downtown Dental Care (Other)');
    console.log('   - Pet Paradise Grooming (Other)');
    console.log('   - Sweet Delights Bakery (Bakery)');
    console.log('   - Artisan Bread Co (Bakery)');
    console.log('\n⏳ PENDING VENDORS (2):');
    console.log('   - Tech Repair Pro (Other)');
    console.log('   - Elite Auto Repair (Other)');
    console.log('\n👷 LABOUR WORKERS (5):');
    console.log('   - Ahmed Khan (Plum6):');
    console.log('   - Mazdoor (Driver) - 4 years exp');
    console.log('     Email: mazdoor@gmail.com | Password: 11221122');
    console.log('   - Ahmed Khan (Plumber) - 8 years exp');
    console.log('   - Hassan Ali (Electrician) - 10 years exp');
    console.log('   - Bilal Mahmood (Carpenter) - 6 years exp');
    console.log('   - Tariq Hussain (Painter) - 5 years exp');
    console.log('   - Rashid Malik (Mason) - 12 years exp');
    console.log('\n   📌 Labour workers can login via Vendor Login page');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();

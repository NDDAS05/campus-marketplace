const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Notice the destructuring { } because of your new export method
const { User } = require('./src/models/User');
const { Listing } = require('./src/models/Listing');

// Load environment variables and connect
dotenv.config();
connectDB();

const runTest = async () => {
  try {
    console.log('--- Starting Updated Model Test ---');

    // 1. Clear previous test data to prevent duplicate unique key errors
    await User.deleteMany({ username: 'test_dev_01' });
    await Listing.deleteMany({ title: 'Used Scientific Calculator' });

    // 2. Create a Dummy User matching your new Enum constraints
    const testUser = new User({
      name: 'Test Student',
      username: 'test_dev_01',
      email: 'testdev@students.iiest.ac.in',
      password: 'secure_password_123',
      stream: 'B.Tech',          // Must exactly match your enum
      department: 'Computer Science',
      year: '2nd Year',          // Must exactly match your enum
      contactInfo: '9876543210',
      isContactDisplayable: true
    });

    const savedUser = await testUser.save();
    console.log(`✅ User saved successfully! ID: ${savedUser._id}`);

    // 3. Create a Dummy Listing (Testing the required seller and images array)
    const testListing = new Listing({
      category: 'Item',
      seller: savedUser._id,     // This is now strictly required
      title: 'Used Scientific Calculator',
      description: 'Casio FX-991EX, works perfectly for 2nd year subjects.',
      count: 1,
      images: ['https://example.com/calc_front.jpg', 'https://example.com/calc_back.jpg'], // Array of strings
      location: 'Hostel 8',
      status: 'Listed'
    });

    const savedListing = await testListing.save();
    console.log(`✅ Listing saved successfully! ID: ${savedListing._id}`);

    // 4. Test the References (Adding to both arrays)
    savedUser.myListings.push(savedListing._id);
    savedUser.wishlist.push(savedListing._id); // Testing your fixed wishlist reference
    
    await savedUser.save();
    console.log('✅ Listing successfully linked to User account arrays!');

    console.log('--- Test Complete. Check MongoDB Atlas! ---');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
};

runTest();
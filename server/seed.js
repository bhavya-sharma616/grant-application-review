require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove old demo users so running the seed again doesn't create duplicates
    await User.deleteMany({
      email: {
        $in: [
          "officer@example.com",
          "reviewer1@example.com",
          "reviewer2@example.com",
          "reviewer3@example.com",
        ],
      },
    });

    const users= [
      {
        name: "Priya Program Officer",
        email: "officer@example.com",
        password: "temporary-password",
        role: "PROGRAM_OFFICER",
      },
      {
        name: "Reviewer One",
        email: "reviewer1@example.com",
        password: "temporary-password",
        role: "REVIEWER",
      },
      {
        name: "Reviewer Two",
        email: "reviewer2@example.com",
        password: "temporary-password",
        role: "REVIEWER",
      },
      {
        name: "Reviewer Three",
        email: "reviewer3@example.com",
        password: "temporary-password",
        role: "REVIEWER",
      },
    ];

    for (const userData of users) {
       const user = new User(userData); 
       await user.save();
      }

    console.log("Demo users created successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedUsers();
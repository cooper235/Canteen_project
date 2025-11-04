import mongoose from "mongoose";
import dotenv from "dotenv";
import Canteen from "../models/Canteen.js";

dotenv.config();

const seedCanteens = [
  {
    name: "Central Cafeteria",
    description: "Main campus dining facility serving diverse cuisines",
    location: "Main Building Ground Floor",
    operatingHours: {
      open: "08:00",
      close: "20:00"
    },
    cuisineTypes: ["Indian", "Chinese", "Continental"],
    contactPhone: "1234567890",
    email: "central@example.com",
    isActive: true,
    isVerified: true,
    owner: new mongoose.Types.ObjectId() // Generate a new ObjectId for the owner
  },
  {
    name: "Engineering Block Cafe",
    description: "Quick bites and beverages for engineering students",
    location: "Engineering Block",
    operatingHours: {
      open: "09:00",
      close: "18:00"
    },
    cuisineTypes: ["Fast Food", "Beverages"],
    contactPhone: "0987654321",
    email: "engcafe@example.com",
    isActive: true,
    isVerified: true,
    owner: new mongoose.Types.ObjectId() // Generate a new ObjectId for the owner
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB for seeding");

    // Clear existing canteens
    await Canteen.deleteMany({});
    console.log("Cleared existing canteens");

    // Insert new canteens
    const createdCanteens = await Canteen.insertMany(seedCanteens);
    console.log("Seeded canteens:", createdCanteens);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
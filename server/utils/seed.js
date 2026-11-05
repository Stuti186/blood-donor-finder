// Run: npm run seed   (creates an admin, sample donors and blood banks near Kanpur)
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import BloodBank from "../models/BloodBank.js";

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Donor.deleteMany({}), BloodBank.deleteMany({})]);
const pw = await bcrypt.hash("password123", 10);
await User.create({ name: "Admin", email: "admin@bloodfinder.com", phone: "9000000000", password: pw, role: "admin", isVerified: true });

const groups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
for (let i = 0; i < 24; i++) {
  const u = await User.create({ name: `Donor ${i + 1}`, email: `donor${i + 1}@test.com`, phone: `98000000${String(i).padStart(2, "0")}`, password: pw, role: "donor", isVerified: true });
  await Donor.create({
    user: u._id, bloodGroup: groups[i % 8], gender: i % 3 ? "male" : "female", city: "Kanpur",
    location: { type: "Point", coordinates: [80.3319 + (Math.random() - 0.5) * 0.15, 26.4499 + (Math.random() - 0.5) * 0.15] },
  });
}
const stock = () => groups.map((g) => ({ bloodGroup: g, units: Math.floor(Math.random() * 12) }));
await BloodBank.insertMany([
  { name: "City Blood Bank", address: "Civil Lines, Kanpur", phone: "0512-0000001", location: { type: "Point", coordinates: [80.35, 26.47] }, stock: stock() },
  { name: "Hospital Blood Centre", address: "Swaroop Nagar, Kanpur", phone: "0512-0000002", location: { type: "Point", coordinates: [80.32, 26.46] }, stock: stock() },
]);
console.log("Seeded. Login: admin@bloodfinder.com / password123 (all seeded users share this password)");
process.exit();

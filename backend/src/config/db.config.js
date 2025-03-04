import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const MONGODB_URI = process.env.MONGODB_URI;
export const connect_db = async () => {
    try {

        console.log()
        await mongoose.connect(MONGODB_URI);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}
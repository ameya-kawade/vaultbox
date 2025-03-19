import mongoose from 'mongoose';

export const connectToDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DATABASE_NAME}?authSource=${process.env.AUTH_SOURCE}`);
        console.log(connectionInstance.connection.host);
    } catch (error) {
        console.log(error);
    }
};
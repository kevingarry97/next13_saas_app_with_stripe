import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(isConnected) {
        return console.log('Is Connected')
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: 'coolApi'
        })
        isConnected = true;

        console.log('MongoDB connected')
    } catch (error) {
        console.log(error);
    }
}
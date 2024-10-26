import mongoose from "mongoose";

const connectDB = async () => {

    try {
        await mongoose.connect(process.env.DB_URI, {
            // useUnifiedTopology: true,
            // useNewUrlParser: true
        })
    } catch(err) {
        console.log('error connecting to mongoDB: ', err)
    }
}

export default connectDB;
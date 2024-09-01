import mongoose from "mongoose";

const connectDB = async()=>{
  try {
    const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/CMS`)
    console.log("Mongo db connect successfully : ", connectionInstance.connection.host);
    
  } catch (error) {
    console.log("mongo db connection error : ", error);
  }
}

export {connectDB}
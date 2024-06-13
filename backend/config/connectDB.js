import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => console.log(`DB HOST :: ${conn.connection.host}`))
      .catch((err) => console.log(`Mongo Db Error :: ${err}`));
  } catch (error) {
    console.log(`Error while connecting to db :: ${error}`);
  }
};

export { connectDB };

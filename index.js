import { app } from "./app.js";
import { connectDB } from "./src/db/index.js";
import dotenv from "dotenv"

dotenv.config({
  path: "./.env"
})

connectDB().then((data) => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server is started on port is : ", process.env.PORT || 500);

  })
})
  .catch((error) => {
    console.log("Mongo db connection failed : ", error);
  })




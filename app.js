
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

dotenv.config({
  path:"./.env"
})

const app = express();



app.use(cors({
  origin:"*",
  credentials:true
}))


app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"))
app.use(cookieParser())

import workersRouter from "./src/routes/workers.routes.js"
import StudentRouter from "./src/routes/student.routes.js"

app.use("/collegeBuddy/api/v1/workers",workersRouter)
app.use("/collegeBuddy/api/v1/student",StudentRouter)



export {app}
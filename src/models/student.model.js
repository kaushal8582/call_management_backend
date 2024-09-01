import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  studentid:{
    type:Number,
    unique:true,
  },
  collegeName:{
    type:String,
    required:true,
  },
  phoneNumber:{
    type:String,
    required:true,
  },
  workerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Worker",
    default:null
  },
  callStatus:{
    type:String,
    default:"pending"
  },
  response:{
    type:String,
    required:false,
    default:''
  },
  reason:{
    type:String,
    default:"",
  },
  interests:{
    type:String,
    default:"",
  },
  followUpDate:{
    type:Date,
    required:false,
    default:null
  }
},{timestamps:true})

export const Student = mongoose.model("Student",studentSchema)
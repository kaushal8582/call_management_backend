import {asyncHandler} from "../utility/asyncHandler.js"
import csv from "csvtojson"
import { Student } from "../models/student.model.js"

import { ApiResponse } from "../utility/ApiResponse.js"
import { ApiError } from "../utility/ApiError.js"
import mongoose from "mongoose"
import { Worker } from "../models/workers.model.js"



const importUser = asyncHandler(async(req, res) => {
  try {
    const userData = [];
    const response = await csv().fromFile(req.file?.path);
    
    response.forEach(data => {
      
      if (data.name && data.collegeName && data.phoneNumber) { // Ensure required fields are present
        userData.push({
          name: data.name,
          studentid:data.studentid,
          collegeName: data.collegeName,
          phoneNumber: data.phoneNumber,
          workerId: (mongoose.Types.ObjectId.isValid(data.workerId)) ? new mongoose.Types.ObjectId(data.workerId) : null, // Validate workerId
          callStatus: data.callStatus || "pending",
          response: data.response || '',
          reason: data.reason || '',
          interests: data.interests || '',
          followUpDate: data.followUpDate && !isNaN(Date.parse(data.followUpDate)) ? new Date(data.followUpDate) : null, // Convert to Date if valid
        });
        
      } else {
        console.log('Missing required fields:', data);
      }
    });

    if (userData.length > 0) {
      await Student.insertMany(userData);
      return res.status(200).json(new ApiResponse(200, "Import data successfully."));
    } else {
      throw new ApiError(400, "No valid data to import");
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Import data error");
  }
});


const updateStudentResponse  = asyncHandler(async(req,res)=>{
  const {callStatus,response,reason,interests,followUpDate} = req.body
  
  const id  = req.params?.id;
  const updateData ={}

  if(callStatus!==undefined) updateData.callStatus = callStatus;
  if(response!==undefined) updateData.response = response;
  if(reason!==undefined) updateData.reason = reason;
  if(interests!==undefined) updateData.interests = interests;
  if(followUpDate!==undefined) updateData.followUpDate = followUpDate;


  const user  = await  Student.findByIdAndUpdate(id,updateData);

  const updatedStudent = await Student.findById(user._id);

  if(!updatedStudent){
    throw new Error("Something went wrong while update student fields");
  }

  return res.status(200).json(new ApiResponse(200,"Student updated successfully ",updatedStudent))

})

const findAllocatedStudentPerWorker = asyncHandler(async(req,res)=>{
  const id = req.params?.id;

  const allStudent = await Student.find({workerId:id})

  if(allStudent.length<=0){
    throw new ApiError(400,"No any student assign to you");
  }

  return res.status(200).json(new ApiResponse(200,"Find all student successfully ", allStudent));
})

const findAllStudentAssignToAParticularWorker = asyncHandler(async (req, res) => {
  const id = req.params?.id;
  const status = req.query?.status || "";  // Dynamic status from query parameter
  const page = parseInt(req.query?.page) || 1;  // Current page, default to 1
  const limit = parseInt(req.query?.limit) || 10;  // Number of items per page, default to 10

  // Find worker by ID
  const worker = await Worker.findById(id);

  // Check if worker is found
  if (!worker) {
    throw new ApiError(400, "Worker not found");
  }

  // Check if range is defined in worker
  if (worker.start_range === undefined || worker.end_range === undefined) {
    throw new ApiError(400, "Worker range is not defined");
  }

  // Prepare the filter based on the worker's range and dynamic status
  let filter = {
    studentid: {
      $gte: worker.start_range,
      $lte: worker.end_range
    }
  };

  // Add status to filter if provided
  if (status) {
    filter.callStatus = status;
  }

  // Find students based on range and status (if provided) with pagination
  const totalStudents = await Student.countDocuments(filter); // Total number of students
  const students = await Student.find(filter)
    .skip((page - 1) * limit)  // Skip records for previous pages
    .limit(limit);  // Limit the number of records per page

  // Assign workerId to each student and save them
  for (let stu of students) {
    stu.workerId = worker._id;
    await stu.save({ validateBeforeSave: true });
  }

  // Check if students are found
  if (students.length <= 0) {
    throw new ApiError(400, "No students found for this worker");
  }

  // Return the students in the response
  return res.status(200).json({
    status: 200,
    message: "Fetched data successfully",
    data: students,
    totalPages: Math.ceil(totalStudents / limit),  // Total number of pages
    currentPage: page  // Current page
  });
});



const getAllStudentInfo = asyncHandler(async(req,res)=>{
  const allData = await Student.find({}).populate('workerId','name email');
  if(allData && allData.length<=0){
    throw new ApiError(400,"Not have any student");
  }

  return res.status(200).json(new ApiResponse(200,"Get all student details successfully ",allData));
})


const deleteStudent = asyncHandler(async(req,res)=>{
  const id = req.params?.id;
  const student = await Student.findByIdAndDelete(id);

  const stu = await Student.findById(student._id);

  if(stu){
    throw new ApiError(400,"Not delete student");
  }

  return res.status(200).json(new ApiResponse(200,"Student delete successfully ",{}));
  
})







export {
  importUser,
  updateStudentResponse,
  findAllocatedStudentPerWorker,
  getAllStudentInfo,
  findAllStudentAssignToAParticularWorker,
  deleteStudent,
}

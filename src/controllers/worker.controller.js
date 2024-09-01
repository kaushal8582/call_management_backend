import { asyncHandler } from "../utility/asyncHandler.js"
import { ApiError } from "../utility/ApiError.js"
import { Worker } from "../models/workers.model.js";
import { ApiResponse } from "../utility/ApiResponse.js"
import { Student } from "../models/student.model.js";
import dotenv from "dotenv"
import bcrypt from "bcrypt"



dotenv.config({
  path: "./.env"
})




const generateAccessAndRefreshToken = async (workerId) => {

  try {
    const worker = await Worker.findById(workerId);
    const accessToken = await worker.generateAccessToken();
    const refreshToken = await worker.generateRefreshToken();
    worker.refreshToken = refreshToken;
    await worker.save({ validateBeforeSave: false });
    return { accessToken, refreshToken }
  } catch (error) {
    console.log("Generating access and refresh token error : ", error);

  }

}

const addAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingAdmin = await Worker.findOne({ role: 'admin' });

  if (existingAdmin) {
    throw new ApiError(403, "Admin allready exist");
  }

  const admin = await Worker.create({
    name: name,
    email: email,
    password: password,
    role: "admin"
  })

  const addedAmin = await Worker.findById(admin._id);
  if (!addedAmin) {
    throw new ApiError(500, "something went wrong while createing admin");
  }

  return res.status(200).json(new ApiResponse(200, "Admin added successfully", addedAmin));

})

const rejisterWorker = asyncHandler(async (req, res) => {
  const { name, email, password, role,start,end } = req.body;

  

  if (!name || !email || !password || !start || !end ) {
    throw new ApiError(400, "All fields are required");
  }

  const worker = await Worker.findOne({email})

  if (worker) {
    throw new ApiError(400, "Worker allready exists");
  }

  const details = await Worker.create({
    name,
    email,
    password,
    role,
    start_range:start,
    end_range:end,
  })

  const workerDetails = await Worker.findById(details._id).select("-password -refreshToken")

  if (!workerDetails) {
    throw new ApiError(500, "Something went wrong while adding workers");
  }

  return res.status(200).json(new ApiResponse(200, "Worker add successfully ", workerDetails));
})


const login = asyncHandler(async (req, res) => {
  const { password, email } = req.body
  console.log(password,email);
  
  if (!password || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await Worker.findOne({ email })

  if (!user) {
    throw new ApiError(400, "User Not found");
  }

  const isCorrectPassword = await user.isCorrectPassword(password)

  if (!isCorrectPassword) {
    throw new ApiError(400, "wrong password ");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
  const loggedInWorker = await Worker.findById(user._id).select("-refreshToken -password")
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, "Login successfully ", {
    worker: loggedInWorker,
    refreshToken: refreshToken,
    accessToken: accessToken
  }));


})

const logout = asyncHandler(async (req, res) => {
  Worker.findByIdAndUpdate(req.user._id,
    {
      $set: {
        refreshToken: undefined
      },
    }, {
    new: true
  }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, "Logout successfully ", {}))
})


const allocateStudentOnWorker = asyncHandler(async (req, res) => {
  const allWorker = await Worker.find({ role: "worker" })

  if (allWorker.length <= 0) {
    throw new ApiError(400, "Workers Not Found");
  }

  const unAssignedStudent = await Student.find({ workerId: null })

  if (unAssignedStudent.length <= 0) {
    throw new ApiError(400, "Not find unassigned student");
  }

  for (const student of unAssignedStudent) {
    let random = Math.floor(Math.random() * allWorker.length);
    await Student.updateOne(
      {
        _id: student._id
      },
      {
        $set: {
          workerId: allWorker[random]._id
        }
      }
    )
  }


  return res.status(200).json(new ApiResponse(200, "Student allocate to all worker successfully", {}));

})

const findMyStudents = asyncHandler(async (req, res) => {
  const id = req.params?.workerId;

  const allStudent = await Student.find({ workerId: id })

  if (allStudent.length <= 0) {
    throw new ApiError(400, "Students Not found");
  }

  return res.status(200).json(new ApiResponse(200, "Students find successfully", allStudent));
})

const deletWorker = asyncHandler(async(req,res)=>{
  const id =req.params.id;
  const worker = await Worker.findByIdAndDelete(id);

  const wo = await Worker.findById(worker._id);
  if(wo){
    throw new ApiError(400,"Worker not found")
  }

  return res.status(200).json(new ApiResponse(200,"Worker delete successfully",{}))

})

const findAllWorker = asyncHandler(async(req,res)=>{
  const workers = await Worker.find({});
  if(workers.length<=0){
    throw new ApiError(400,"not have any worker ")
  }
  return res.status(200).json(new ApiResponse(200,"Find all worker successfully",workers));
})


const updateWorkerDetails = asyncHandler(async(req,res)=>{
  const id = req.params?.id;
  const { password, start, end } = req.body;
  
  const updateDetails = {};

  console.log(password,start,end);
  
  // Add fields to update only if they are defined in the request
  // if (password !== undefined && password!=="") updateDetails.password = password;
  if (password) {
    updateDetails.password = await bcrypt.hash(password, 10); // Hash the password before updating
  }
  if (start !== undefined) updateDetails.start_range = start;
  if (end !== undefined) updateDetails.end_range = end;

  // Perform the update operation
  const work = await Worker.findByIdAndUpdate(id, updateDetails, { new: true, runValidators: true });

  if (!work) {
    throw new ApiError(400, "Worker not updated");
  }
  console.log(work);
  

  return res.status(200).json(new ApiResponse(200, "Worker updated successfully", work));
});




export {
  rejisterWorker,
  login,
  logout,
  allocateStudentOnWorker,
  findMyStudents,
  addAdmin,
  deletWorker,
  findAllWorker,
  updateWorkerDetails,
}


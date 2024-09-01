import JWT from "jsonwebtoken"
import { asyncHandler } from "../utility/asyncHandler.js"
import { ApiError } from "../utility/ApiError.js"
import { Worker } from "../models/workers.model.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      throw new ApiError(400, "invalid token");
    }
    const decodedToken =  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await Worker.findById(decodedToken.id).select("-password -refreshToken")
    if (!user) {
      throw new ApiError(400, "invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400,"invalid access token");
  }

})

const verifyAdmin = async (req,res,next)=>{
 try {
  const user = req.user;
  if(user.role && user.role=="admin"){
    next();
  }
 } catch (error) {
  throw new ApiError(400,"access denied")
 }  


}


export {
  verifyJWT,
  verifyAdmin,
}
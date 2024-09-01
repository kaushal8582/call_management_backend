import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"
import { deleteStudent, findAllocatedStudentPerWorker, findAllStudentAssignToAParticularWorker, getAllStudentInfo, importUser, updateStudentResponse } from "../controllers/students.controller.js";

const router = Router();


router.route("/import-user").post(verifyJWT,verifyAdmin,upload.single("file"),importUser)
router.route("/update-student-response/:id").post(verifyJWT,updateStudentResponse)
router.route("/find-my-student/:id").post(verifyJWT,findAllStudentAssignToAParticularWorker);
router.route("/get-all-student").get(verifyJWT,verifyAdmin,getAllStudentInfo);
router.route("/delete-student/:id").get(verifyJWT,verifyAdmin,deleteStudent);



export default router;
import {Router} from "express"
import { verifyAdmin, verifyJWT } from "../middleware/auth.middleware.js";
import { addAdmin, allocateStudentOnWorker, deletWorker, findAllWorker, login, logout, rejisterWorker, updateWorkerDetails } from "../controllers/worker.controller.js";


const router = Router();

router.route("/rejister-worker").post(verifyJWT,verifyAdmin,rejisterWorker)
router.route("/add-admin").post(addAdmin)
router.route("/auto-allocate").get(verifyJWT,verifyAdmin,allocateStudentOnWorker);
router.route("/login").post(login);
router.route("/logout").get(verifyJWT,logout);

router.route("/delete-worker/:id").get(verifyJWT,verifyAdmin,deletWorker);
router.route("/findall-worker").get(verifyJWT,verifyAdmin,findAllWorker);
router.route("/update-worker/:id").post(verifyJWT,verifyAdmin,updateWorkerDetails)


export default router;
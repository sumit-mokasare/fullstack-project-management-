import { Router } from "express";
import { taskValidetor } from "../validatores/index.js";
import validate from "../middlewares/validator.middleware.js";
import { createTask } from "../controller/task.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleswares.js";
const router = Router()
router.use(verifyJwt)

router.route('/:projectId').post( upload.array('files' , 3), taskValidetor() , validate , createTask)
export default router
import { Router } from 'express';
import { taskValidetor } from '../validatores/index.js';
import validate from '../middlewares/validator.middleware.js';
import {
  createTask,
  deleteTask,
  getTasks,
  getTasksById,
  updateTask,
  updateTaskStatus,
} from '../controller/task.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { isProjctAdmin, verifyJwt } from '../middlewares/auth.middleswares.js';
import { UserRolesEnum } from '../utils/constants.js';
const router = Router();
router.use(verifyJwt);

router
  .route('/:projectId')
  .post(
    upload.array('files', 3),
    isProjctAdmin([UserRolesEnum.ADMIN]),
    taskValidetor(),
    validate,
    createTask
  )
  .get(getTasks);

router
  .route('/:projectId/updateStatus/:taskId')
  .put(upload.none() , isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]), updateTaskStatus);

router
  .route('/:projectId/task/:taskId')
  .get(isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]), getTasksById)
  .put(
    upload.none(),
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]),
    taskValidetor(),
    validate,
    updateTask
  )
  .delete(isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]), deleteTask);
export default router;

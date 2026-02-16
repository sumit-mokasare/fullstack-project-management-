import { Router } from 'express';
import { subtaskValidetor, taskValidetor } from '../validatores/index.js';
import validate from '../middlewares/validator.middleware.js';
import {
  addSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getSubTask,
  getTasks,
  getTasksById,
  updateSubTask,
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
  .get(
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER, UserRolesEnum.MEMBER]),
    getTasks
  );

router
  .route('/:projectId/updateStatus/:taskId')
  .put(
    upload.none(),
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]),
    updateTaskStatus
  );

router
  .route('/:projectId/task/:taskId')
  .get(
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER, UserRolesEnum.MEMBER]),
    getTasksById
  )
  .put(
    upload.none(),
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]),
    taskValidetor(),
    validate,
    updateTask
  )
  .delete(isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]), deleteTask);

// subtask routes

router
  .route('/:projectId/subtask/:taskId')
  .post(
    upload.none(),
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]),
    subtaskValidetor(),
    validate,
    addSubTask
  )
  .get(
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER, UserRolesEnum.MEMBER]),
    getSubTask
  );

router
  .route('/:projectId/updatedSubTask/:taskId/:subtaskId')
  .put(
    upload.none(),
    isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]),
    subtaskValidetor(),
    validate,
    updateSubTask
  )
  .delete(isProjctAdmin([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_MANGER]), deleteSubTask);
export default router;

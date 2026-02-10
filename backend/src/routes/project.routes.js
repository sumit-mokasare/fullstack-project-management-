import { Router } from 'express';
import { validateProjectPermissions, verifyJwt } from '../middlewares/auth.middleswares.js';
import { validate } from '../middlewares/validator.middleware.js';
import { projectCreateValidetor } from '../validatores/index.js';
import { upload } from '../middlewares/multer.middleware.js';
import {addMemberToProject, createProject, deleteProject, getProjects, getProjectsById, updateProject } from '../controller/project.controller.js';
import { UserRolesEnum } from '../utils/constants.js';

const router = Router();

router
  .route('/createProject')
  .post(upload.none(), verifyJwt, projectCreateValidetor(), validate, createProject);
router.route('/getProject').get(verifyJwt, getProjects);
router.route('/projectById/:projectId').get(getProjectsById);
router.route('/updateProject/:projectId').patch(upload.none() , projectCreateValidetor(), validate, updateProject);
router.route('/deleteProject/:projectId').delete(deleteProject);
router.route('/:projectId/member').post( validateProjectPermissions([UserRolesEnum.ADMIN]), addMemberToProject);

export default router;

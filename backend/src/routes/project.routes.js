import { Router } from 'express';
import { isProjctAdmin, verifyJwt } from '../middlewares/auth.middleswares.js';
import { validate } from '../middlewares/validator.middleware.js';
import { projectCreateValidetor, projectMemberValidetor } from '../validatores/index.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectMembers,
  getProjects,
  getProjectsById,
  updateMemberRole,
  updateProject,
  updateProjectMembers,
} from '../controller/project.controller.js';
import { UserRolesEnum } from '../utils/constants.js';

const router = Router();

router
  .route('/createProject')
  .post(upload.none(), verifyJwt, projectCreateValidetor(), validate, createProject);
router.route('/getProject').get(verifyJwt, getProjects);
router.route('/projectById/:projectId').get(getProjectsById);
router
  .route('/updateProject/:projectId')
  .patch(
    upload.none(),
    verifyJwt,
    isProjctAdmin([UserRolesEnum.ADMIN]),
    projectCreateValidetor(),
    validate,
    updateProject
  );
router
  .route('/deleteProject/:projectId')
  .delete(verifyJwt, isProjctAdmin([UserRolesEnum.ADMIN]), deleteProject);
router
  .route('/:projectId/member')
  .post(
    upload.none(),
    verifyJwt,
    isProjctAdmin([UserRolesEnum.ADMIN]),
    projectMemberValidetor(),
    validate,
    addMemberToProject
  );

router.route('/getMember/:projectId').get(getProjectMembers);
router
  .route('/:projectId/updateMemberUser/:memberId')
  .post(upload.none(), verifyJwt, isProjctAdmin([UserRolesEnum.ADMIN]), updateProjectMembers);
router
  .route('/:projectId/updateMember/:memberId')
  .post(upload.none(), verifyJwt, isProjctAdmin([UserRolesEnum.ADMIN]), updateMemberRole);
router
  .route('/:projectId/deleteMember/:memberId')
  .get(verifyJwt, isProjctAdmin([UserRolesEnum.ADMIN]), deleteMember);
export default router;

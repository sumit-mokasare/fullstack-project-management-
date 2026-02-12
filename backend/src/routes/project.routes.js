import { Router } from 'express';
import { isProjctAdmin, verifyJwt } from '../middlewares/auth.middleswares.js';
import { validate } from '../middlewares/validator.middleware.js';
import { projectCreateValidetor, projectMemberValidetor, updateProjectMembersValidetor } from '../validatores/index.js';
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

router.use(verifyJwt);
router.use(upload.none());

// ===== project routes ==== 

router.route('/createProject').post(projectCreateValidetor(), validate, createProject);
router.route('/getProject').get(getProjects);
router
  .route('/:projectId')
  .get(getProjectsById)
  .patch(isProjctAdmin([UserRolesEnum.ADMIN]), projectCreateValidetor(), validate, updateProject)
  .delete(verifyJwt, isProjctAdmin([UserRolesEnum.ADMIN]), deleteProject);

  // ===== project Member routes ==== 

router
  .route('/:projectId/member')
  .post(
    isProjctAdmin([UserRolesEnum.ADMIN]),
    projectMemberValidetor(),
    validate,
    addMemberToProject
  );
router.route('/getMember/:projectId').get(getProjectMembers);
router
  .route('/:projectId/member/:memberId')
  .patch(updateProjectMembersValidetor() , validate , isProjctAdmin([UserRolesEnum.ADMIN]), updateProjectMembers)
  .post(isProjctAdmin([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(isProjctAdmin([UserRolesEnum.ADMIN]), deleteMember);


export default router;

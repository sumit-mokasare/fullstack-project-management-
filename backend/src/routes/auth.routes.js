import { Router } from 'express';
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationEmail, verifyEmail } from '../controller/auth.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userLoginValidator, userRegistrationValidatore } from '../validatores/index.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleswares.js';

const router = Router();

router
  .route('/register')
  .post(upload.single('avatar'), userRegistrationValidatore(), validate, registerUser); // factory pattern
router.route("/verify/:token").get(verifyEmail)
router.route("/resent-verification").get(resendVerificationEmail)
router.route("/loginUser").post(upload.none() , userLoginValidator() , validate , loginUser)
router.route("/logoutUser").post(verifyJwt , logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/Profile").get(verifyJwt , getCurrentUser)
router.route("/forgotPassword").get(verifyJwt , forgotPasswordRequest)
router.route("/changePassword/:token").post(upload.none() , changeCurrentPassword)



export default router;

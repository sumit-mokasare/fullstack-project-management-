import { Router } from "express";
import { isProjctAdmin, verifyJwt } from "../middlewares/auth.middleswares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controller/note.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router()

router.use(upload.none());
router.use(verifyJwt);

router
    .route('/:projectId')
    .get(isProjctAdmin(AvailableUserRoles) , getNotes)
    .post( isProjctAdmin([UserRolesEnum.ADMIN]) , createNote)

router
    .route('/:projectId/notes/:noteId')
    .get(isProjctAdmin(AvailableUserRoles), getNoteById)
    .put(isProjctAdmin([UserRolesEnum.ADMIN]), updateNote)
    .delete(isProjctAdmin([UserRolesEnum.ADMIN]), deleteNote)


export default router
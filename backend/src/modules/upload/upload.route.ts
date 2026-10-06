import { Router } from "express";
import { bannerMediaUpload, notesMediaUpload, profileMediaUpload, resumeMediaUpload, documentMediaUpload } from "../../config/db.multer.js";
import { uploadController } from "./upload.controller.js";

const uploadRouter = Router();

uploadRouter
    .post("/profile", profileMediaUpload.single("media"), uploadController)
    .post("/banner", bannerMediaUpload.single("media"), uploadController)
    .post("/notes", notesMediaUpload.single("media"), uploadController)
    .post("/resume", resumeMediaUpload.single("media"), uploadController)
    .post("/document", documentMediaUpload.single("media"), uploadController);

export default uploadRouter;
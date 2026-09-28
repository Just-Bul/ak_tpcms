import multer from 'multer';

const profileMediaStorage = multer.diskStorage({
    destination:    (req, file, callback) => {
        callback(null, "public/profile_media/");
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});
export const profileMediaUpload = multer({ storage: profileMediaStorage });

const resumeMediaStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/resume_media/");
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});
export const resumeMediaUpload= multer({ storage: resumeMediaStorage });

const bannerMediaStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/banner_media/");
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});
export const bannerMediaUpload = multer({ storage: bannerMediaStorage });

const notesMediaStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/notes_media/");
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});
export const notesMediaUpload = multer({ storage: notesMediaStorage });

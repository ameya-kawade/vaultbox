import multer from "multer";
import { __dirname } from "../../root.js";
import sanitize from "sanitize-filename";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/uploads/`);
    },
    filename: (req, file, cb) => {
        const filename = sanitize(file.originalname);
        cb(null, `${uuidv4()}-${filename}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
        return cb(new Error('File size exceeds the 100MB limit.'), false);
    }

    // Check file extension
    const allowedExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv|mp3|mp4|wav|avi|mov|wmv|zip|rar|7z)$/i;
    
    const originalName = file.originalname.toLowerCase();

    if (!allowedExtensions.test(originalName)) {
        return cb(new Error('File type not allowed.'), false);
    }

    cb(null, true);
};

const fileUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB size limit
}).array("files", 10);

export default fileUpload;
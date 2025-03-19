import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getContacts } from "../controllers/messages/messages.controller.js";
import authenticate from "../middlewares/authenticate.js";
import fileUpload from "../middlewares/fileUpload.js";
import {
  propogateFileMessage,
  presignedUrlRenewal,
  deleteFile,
} from "../controllers/utilControllers.js";
import { getChat } from "../controllers/messages/messages.controller.js";

const messagesRouter = Router();

messagesRouter
  .route("/")
  .get(asyncHandler(authenticate), asyncHandler(getContacts));

messagesRouter
  .route("/getchat/:receiverId")
  .get(asyncHandler(authenticate), asyncHandler(getChat));

messagesRouter
  .route("/upload")
  .post(
    asyncHandler(authenticate),
    asyncHandler(fileUpload),
    asyncHandler(propogateFileMessage),
  );

messagesRouter
  .route("/deleteFile")
  .post(asyncHandler(authenticate), asyncHandler(deleteFile));

messagesRouter
  .route("/renewUrl/:messageId")
  .get(asyncHandler(authenticate), asyncHandler(presignedUrlRenewal));

export default messagesRouter;

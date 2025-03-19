import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addMember,
  getChannels,
  getChat,
  removeMember,
  addMemberToContacts, 
  getChannelMembers, 
  createChannel,
  deleteChannel
} from "../controllers/channels/channels.controller.js";
import authenticate from "../middlewares/authenticate.js";
import fileUpload from "../middlewares/fileUpload.js";
import {
  presignedUrlRenewal,
  propogateFileMessage,
  deleteFile,
} from "../controllers/utilControllers.js";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";
import { searchUsers } from "../controllers/users/user.controller.js";

const channelsRouter = Router();

channelsRouter
  .route("/")
  .get(asyncHandler(authenticate), asyncHandler(getChannels));

channelsRouter
  .route("/addMember")
  .post(
    asyncHandler(authenticate),
    asyncHandler(authorizeAdmin),
    asyncHandler(addMember),
  );

channelsRouter
  .route("/removeMember")
  .post(
    asyncHandler(authenticate),
    asyncHandler(authorizeAdmin),
    asyncHandler(removeMember),
  );

channelsRouter
  .route("/getChat/:channelId")
  .get(asyncHandler(authenticate), asyncHandler(getChat));

channelsRouter
  .route("/upload")
  .post(
    asyncHandler(authenticate),
    asyncHandler(fileUpload),
    asyncHandler(propogateFileMessage),
  );

channelsRouter
  .route("/deleteFile")
  .post(
    asyncHandler(authenticate),
    asyncHandler(authorizeAdmin),
    asyncHandler(deleteFile),
  );

channelsRouter
  .route("/renewUrl/:messageId")
  .get(asyncHandler(authenticate), asyncHandler(presignedUrlRenewal));


channelsRouter
  .route('/:channelId/members')
  .get(asyncHandler(authenticate), asyncHandler(getChannelMembers))

channelsRouter
  .route("/addContact")
  .post(asyncHandler(authenticate), asyncHandler(addMemberToContacts));

channelsRouter
  .route("/create")
  .post(
    asyncHandler(authenticate), 
    asyncHandler(createChannel)
  );

channelsRouter
  .route("/delete/:channelId")
  .delete(asyncHandler(authenticate), asyncHandler(deleteChannel));

channelsRouter
  .route('/search')
  .get(
    asyncHandler(authenticate),
    asyncHandler(searchUsers)
  );

export default channelsRouter;

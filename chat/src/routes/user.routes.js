import express from "express";
import { asyncHandler } from '../utils/asyncHandler.js';
import  authenticate  from "../middlewares/authenticate.js";
import { searchUsers, updateUserPublicKey } from "../controllers/users/user.controller.js";

const userRouter = express.Router();

userRouter.route('/key/:userId').post(
    asyncHandler(authenticate),
    asyncHandler(updateUserPublicKey)
);

userRouter.route('/search').get(
    asyncHandler(authenticate),
    asyncHandler(searchUsers)
);
export default userRouter;

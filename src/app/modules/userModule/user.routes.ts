import express from "express";
import userControllers from "./user.controllers";
import UserValidationZodSchema from "./user.validation";
import requestValidator from "../../middlewares/requestValidator";

const userRouter = express.Router();

userRouter.post('/create', requestValidator(UserValidationZodSchema.createUserZodSchema), userControllers.createUser)
userRouter.get('/retrive/search', userControllers.getAllUser)
userRouter.get('/retrive/recent', userControllers.getRecentUsers)
userRouter.get('/retrive/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.getSpecificUser)
userRouter.patch('/update/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.updateSpecificUser)
userRouter.delete('/delete/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.deleteSpecificUser)
userRouter.patch('/update/profile-picture/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.changeUserProfileImage)

export default userRouter



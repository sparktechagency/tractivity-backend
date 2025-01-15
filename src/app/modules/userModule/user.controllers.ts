import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import IdGenerator from '../../../utils/IdGenerator';
import CustomError from '../../errors';
import userServices from './user.services';
import sendMail from '../../../utils/sendEmail';
import { Request, Response } from 'express';
import jwtHelpers from '../../../healpers/healper.jwt';
import config from '../../../config';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';

// controller for create new user
const createUser = async (req: Request, res: Response) => {
  const userData = req.body;
  const files = req.files;

  const expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + 30);

  userData.verification = {
    code: IdGenerator.generateNumberId(),
    expireDate,
  };

  // token for social user
  let accessToken, refreshToken;
  if (userData.isSocial) {
    userData.isEmailVerified = true;

    const payload = {
      email: userData.email,
      role: 'user',
    };
    accessToken = jwtHelpers.createToken(payload, config.jwt_access_token_secret as string, config.jwt_access_token_expiresin as string);
    refreshToken = jwtHelpers.createToken(payload, config.jwt_refresh_token_secret as string, config.jwt_refresh_token_expiresin as string);
  }

  if (files) {
    const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
    userData.image = userImagePath;
  }

  const user = await userServices.createUser(userData);
  if (!user) {
    throw new CustomError.BadRequestError('Failed to create new user!');
  }

  const { password, ...userInfoAcceptPass } = user.toObject();

  if (!userData.isSocial) {
    // send email verification mail
    const content = `Your email veirfication code is ${userData?.verification?.code}`;
    // const verificationLink = `${server_base_url}/v1/auth/verify-email/${user._id}?userCode=${userData.verification.code}`
    // const content = `Click the following link to verify your email: ${verificationLink}`
    const mailOptions = {
      from: config.gmail_app_user as string,
      to: userData.email,
      subject: 'JoinUp - Email Verification',
      text: content,
    };

    sendMail(mailOptions);
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'User creation successfull',
    data: { ...userInfoAcceptPass, accessToken, refreshToken },
  });
};

// service for get specific user by id
const getSpecificUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userServices.getSpecificUser(id);
  if (!user) {
    throw new CustomError.NotFoundError('User not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User retrive successfull',
    data: user,
  });
};
// service for get specific user by id
const getAllUser = async (req: Request, res: Response) => {
  const { query, role } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const users = await userServices.getAllUser(query as string, role as string, skip, limit);

  const totalUsers = users.length || 0;
  const totalPages = Math.ceil(totalUsers / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User retrive successfull',
    meta: {
      totalData: totalUsers,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: users,
  });
};

// controller for delete specific user
const deleteSpecificUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userServices.deleteSpecificUser(id);
  if (!user.deletedCount) {
    throw new CustomError.BadRequestError('Failed to delete user!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User delete successfull',
  });
};

// controller for update specific user
const updateSpecificUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files;

  if (data.password || data.email || data.isEmailVerified) {
    throw new CustomError.BadRequestError("You can't update email, verified status and password directly!");
  }

  if (files) {
    const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
    data.image = userImagePath;
  }

  const updatedUser = await userServices.updateSpecificUser(id, data);
  if (!updatedUser.modifiedCount) {
    throw new CustomError.BadRequestError('Failed to update user!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User modified successfull',
  });
};

// controller for change profile image of specific user
const changeUserProfileImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files;
  // console.log(files)
  const user = await userServices.getSpecificUser(id);
  // console.log(req.files)
  if (!user) {
    throw new CustomError.NotFoundError('No user found!');
  }

  const userImagePath = await fileUploader(files as FileArray, `user-image`, 'image');
  const updateUser = await userServices.updateSpecificUser(id, {
    image: userImagePath as string,
  });

  if (!updateUser.modifiedCount) {
    throw new CustomError.BadRequestError('Failed to change user profile image!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'User profile change successfull',
  });
};

// controller for get recent user
const getRecentUsers = async (req: Request, res: Response) => {
  const users = await userServices.getRecentUsers()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Recent users retrive successfull.',
    data: users
  })
}

export default {
  createUser,
  getSpecificUser,
  getAllUser,
  deleteSpecificUser,
  updateSpecificUser,
  changeUserProfileImage,
  getRecentUsers,
};

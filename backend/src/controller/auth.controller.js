import { asyncHandler } from '../utils/async-handler.js';
import { apiResponse } from '../utils/api-response.js';
import { apiError } from '../utils/api-error.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {
  sentMail,
  emailVerificationMailgenContent,
  forgotPassowordMailgenContent,
} from '../utils/mail.js';
import { cookieOptions } from '../utils/constants.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username, fullname } = req.body;
  console.log(req.file);

  const avatar = req.file?.path;
  console.log(avatar);

  const exsitsUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exsitsUser) {
    throw new apiError(400, 'Username and Email already Exist', false);
  }

  let avatarData;
  if (avatar) {
    const cloudinaryResponse = await uploadOnCloudinary(avatar);
    if (cloudinaryResponse) {
      avatarData = {
        url: cloudinaryResponse.url,
        localpath: cloudinaryResponse.public_id,
      };
    }
  }

  const user = await User.create({
    fullname,
    email,
    username,
    password,
    avatar: avatarData,
  });
  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) {
    throw new apiError(500, 'Somthing went wrong while registering a user');
  }
  const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save();

  const verificationUrl = `${process.env.BASE_URL}/api/v1/userAuth/verify/${unHashedToken}`;
  const content = emailVerificationMailgenContent(user.username, verificationUrl);
  await sentMail({
    email: user.email,
    subject: ' Verify you are email',
    mailGenContent: content,
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        createdUser,
        'User created Successfully Please Verify your email addres',
        true
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = await crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new apiError(400, 'Invalid or expired Verification token', false);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  //  send success response
  return res.status(200).json(new apiResponse(200, {}, 'User verified Successfully', true));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, 'Email is required', false);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(400, 'User not found', false);
  }

  if (user.isEmailVerified) {
    throw new apiError(200, 'Email already Verified', true);
  }
  const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save();

  const verificationUrl = `${process.env.BASE_URL}/api/v1/userAuth/verify/${unHashedToken}`;
  const content = emailVerificationMailgenContent(user.username, verificationUrl);
  await sentMail({
    email: user.email,
    subject: ' Verify your email',
    mailGenContent: content,
  });

  return res.status(200).json(new apiResponse(200, {}, 'Resent verification token', true));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(400, 'Invalied email', false);
  }
  // check is user verified
  if (!user.isEmailVerified) {
    throw new apiError(400, 'Please verify your email', false);
  }

  const isPasswordCorrect = await user.isCorrectPassword(password);

  if (!isPasswordCorrect) {
    throw new apiError(400, 'Invalied email or passoword', false);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  return res
    .status(201)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new apiResponse(
        201,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged In successfuly',
        true
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new apiResponse(200, {}, 'User logged Out successfully', true));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshtoken) {
    throw new apiError(400, 'Unauthorized request', false);
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECREAT);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, 'User not found Invalied Refresh token', false);
    }

    if (incomingRefreshtoken !== user.refreshToken) {
      throw new apiError(400, 'Refresh token is exired or used');
    }

    // generate new access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          'access Token refreshed successfully',
          true
        )
      );
  } catch (error) {
    console.log('Error while refreshAccess token', error.message);
    throw new apiError(500, error.message || 'Invalid Refesh token', false);
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new apiError(400, 'Unathorized user not found while forgot password', false);
  }

  const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const forgotPasswordUrl = `${process.env.BASE_URL}/api/v1/userAuth/forgotPassword/${unHashedToken}`;
  const content = forgotPassowordMailgenContent(user.username, forgotPasswordUrl);
  sentMail({
    email: user.email,
    subject: 'Forgot your password',
    mailGenContent: content,
  });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {},
        'Forgot password Request Send to your Email please check out user email',
        true
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { token } = req.params;
  const { password } = req.body;
  
  const hashedIncomingToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    $or: [
      { forgotPasswordToken: hashedIncomingToken },
      { forgotPasswordTokenExpiry: { $gt: Date.now() } },
    ],
  });

  if (!user) {
    throw new apiError(400, 'Invalied expired token', false);
  }

  user.password = password;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new apiResponse(200, {}, 'Password successfully changes', true));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // get Id from req.user
  const userId = req.user.id;
  // find user beast on id
  const user = await User.findById(userId).select('-password -refreshToken');
  // check if user is Exist
  if (!user) {
    throw new apiError(400, 'user Not found', false);
  }

  return res.status(200).json(new apiResponse(200, user, 'Successfully get user', true));
});

export {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  forgotPasswordRequest,
  changeCurrentPassword,
};

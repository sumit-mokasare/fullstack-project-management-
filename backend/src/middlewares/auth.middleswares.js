import mongoose from 'mongoose';
import { ProjectMember } from '../models/projectmember.models.js';
import { User } from '../models/user.models.js';
import { apiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import jwt from 'jsonwebtoken';

const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    // console.log(token ? 'token milaa' : 'token nahi milaa');

    if (!token) {
      throw new apiError(400, 'Unauthorized token', false);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select('-password -refreshtoken');

    if (!user) {
      throw new apiError(400, 'Invalied access token', false);
    }

    req.user = user;
    next();
  } catch (error) {
    // Access token expired
    if (error.name === 'TokenExpiredError') {
      throw new apiError(401, 'Access token expired. Please refresh token.', false);
    }

    // Invalid token (modified, fake, wrong secret)
    if (error.name === 'JsonWebTokenError') {
      throw new apiError(401, 'Invalid access token', false);
    }
    console.log(error);

    throw new apiError(401, error?.message || 'Invalid access token', false);
  }
});

const validateProjectPermissions = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    console.log(req.user);
    
    const { projectId } = req.params;

    if (!projectId) {
      throw new apiError(400, 'Project ID is missing', false);
    }

    const projectMember = await ProjectMember.findOne({
      project: mongoose.Types.ObjectId(projectId),
      user: mongoose.Types.ObjectId(req.user._id),
    });

    if (!projectMember) {
      throw new apiError(403, 'Project  not found ', false);
    }
    
    const givenRole = projectMember.role;
    req.user.role = givenRole;
    
    if (!roles.includes(givenRole)) {
      throw new apiError(403, 'You do not have permission to perform this action', false);
    }

    next()
  });

export { verifyJwt , validateProjectPermissions };

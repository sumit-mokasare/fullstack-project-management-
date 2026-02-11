import mongoose from 'mongoose';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { asyncHandler } from '../utils/async-handler.js';
import { UserRolesEnum } from '../utils/constants.js';
import { apiResponse } from '../utils/api-response.js';
import { apiError } from '../utils/api-error.js';
import { User } from '../models/user.models.js';

const createProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: userId,
    }).populate('createdBy', 'username avatar fullname');

    await ProjectMember.create({
      user: userId,
      project: mongoose.Types.ObjectId(project._id),
      role: UserRolesEnum.ADMIN,
    });

    return res
      .status(201)
      .json(new apiResponse(201, project, 'project created successfully', true));
  } catch (error) {
    console.log('Error to create Project', error);
  }
});

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const projectsMember = await ProjectMember.find({ user: userId }).populate({
    path: 'project',
    select: 'name description createdBy createdAt',
  });

  console.log(projectsMember);

  if (!projectsMember) {
    throw new apiError(404, 'Project Member not found', false);
  }

  const project = projectsMember.map((m) => ({
    _id: m.project._id,
    name: m.project.name,
    description: m.project.description,
    role: m.role,
    createdAt: m.project.createdAt,
    updatedAt: m.project.updatedAt,
  }));

  return res.status(200).json(new apiResponse(200, project, 'Project get successfully', true));
});

const getProjectsById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate(
    'createdBy',
    'fullname avatar username'
  );

  if (!project) {
    throw new apiError(404, 'Project not found ', false);
  }

  return res.status(200).json(new apiResponse(200, project, 'Project fetch successfully', true));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;


  const project = await Project.findById(projectId);

  if (!project) {
    throw new apiError(404, 'project not found', false);
  }

  const member = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(projectId),
    role: UserRolesEnum.ADMIN,
  });

  if (!member) {
    throw new apiError(404, 'Only admin can update this project', false);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true }
  ).populate('createdBy', 'username avatar fullname');

  if (!updateProject) {
    throw new apiError(404, 'Project while update not found', false);
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedProject, 'project update successfully', true));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const member = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(projectId),
    role: UserRolesEnum.ADMIN,
  });

  if (!member) {
    throw new apiError(404, 'Only admin can delete this project', false);
  }

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new apiError(404, 'project not found', false);
  }

  await ProjectMember.deleteMany({ project: projectId });
  // await.deleteMany({ project: projectId });

  return res.status(200).json(new apiResponse(200, {}, 'Project deleted successfully', true));
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, 'User not found', false);
  }

  const exist = await ProjectMember.findOne({
    project: mongoose.Types.ObjectId(projectId),
    user: mongoose.Types.ObjectId(user._id),
  });

  if (exist) {
    throw new apiError(400, 'User already a member of this project', false);
  }

  const member = await ProjectMember.create({
    user: mongoose.Types.ObjectId(user._id),
    project: mongoose.Types.ObjectId(projectId),
    role: role,
  });

  return res.status(201).json(new apiResponse(201, member, 'Member added successfully', true));
});

const getProjectMembers = asyncHandler(async (req, res) => {});

const updateProjectMembers = asyncHandler(async (req, res) => {});

const updateMemberRole = asyncHandler(async (req, res) => {});

const deleteMember = asyncHandler(async (req, res) => {});

export {
  createProject,
  getProjects,
  getProjectsById,
  updateProject,
  deleteProject,
  addMemberToProject,
};

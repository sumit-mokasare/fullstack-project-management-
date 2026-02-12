import mongoose from 'mongoose';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { asyncHandler } from '../utils/async-handler.js';
import { UserRolesEnum } from '../utils/constants.js';
import { apiResponse } from '../utils/api-response.js';
import { apiError } from '../utils/api-error.js';
import { User } from '../models/user.models.js';
import { ProjectNote } from '../models/note.models.js';

const createProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, description } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [project] = await Project.create(
      [
        {
          name,
          description,
          createdBy: userId,
        },
      ],
      { session }
    );

    await ProjectMember.create(
      [
        {
          user: userId,
          project: project._id,
          role: UserRolesEnum.ADMIN,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    await project.populate('createdBy', 'username avatar fullname');

    return res
      .status(201)
      .json(new apiResponse(201, project, 'project created successfully', true));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
  await ProjectNote.deleteMany({ project: projectId });

  return res.status(200).json(new apiResponse(200, {}, 'Project deleted successfully', true));
});

const addMemberToProject = asyncHandler(async (req, res) => {
  console.log('user inside controller ==', req.user);

  const { projectId } = req.params;
  const { email, role } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, 'User not found', false);
  }

  const exist = await ProjectMember.findOne({
    project: projectId,
    user: user._id,
  });

  if (exist) {
    throw new apiError(400, 'User already a member of this project', false);
  }

  const member = await ProjectMember.create({
    user: user._id,
    project: projectId,
    role: role,
  });

  return res.status(201).json(new apiResponse(201, member, 'Member added successfully', true));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  console.log(projectId);

  const members = await ProjectMember.find({
    project: projectId,
  }).populate('user', 'fullname avatar username');

  if (!members) {
    throw new apiError(400, 'membs not found', false);
  }

  return res.status(200).json(new apiResponse(200, members, 'membes fetch successfully'));
});

const updateProjectMembers = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { email } = req.body;

  const newUser = await User.findOne({ email });
  console.log(newUser);

  if (!newUser) {
    throw new apiError(400, 'User not found', false);
  }

  const alreadyMember = await ProjectMember.findOne({
    user: newUser._id,
    project: projectId,
  });

  if (alreadyMember) {
    throw new apiError(400, 'User is already a member', false);
  }

  const updatedMamber = await ProjectMember.findByIdAndUpdate(
    memberId,
    {
      user: newUser._id,
    },
    { new: true }
  ).populate('user', 'fullname avatar username');

  if (!updatedMamber) {
    throw new apiError(401, 'mamber not updated', false);
  }

  return res.status(200).json(new apiResponse(200, updatedMamber, 'Member update successfully'));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  // 3. Update role
  const updated = await ProjectMember.findByIdAndUpdate(memberId, { role }, { new: true }).populate(
    'user',
    'fullname avatar username'
  );

  if (!updated) {
    throw new apiError(404, 'Member not found');
  }

  return res.status(200).json(new apiResponse(200, updated, 'Role updated successfully'));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const member = await ProjectMember.findByIdAndDelete(memberId).populate('user', 'fullname avatar username');

  if (!member) {
    throw new apiError(400, 'mamber not found', false);
  }

  return res.status(200).json(new apiResponse(200, member, 'Member delete successfully'));
});

export {
  createProject,
  getProjects,
  getProjectsById,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateProjectMembers,
  updateMemberRole,
  deleteMember, 
};

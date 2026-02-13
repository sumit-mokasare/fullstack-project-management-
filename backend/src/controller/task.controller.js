import { ProjectMember } from '../models/projectmember.models.js';
import { Task } from '../models/task.models.js';
import { User } from '../models/user.models.js';
import { apiError } from '../utils/api-error.js';
import { apiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, email } = req.body;
  const { projectId } = req.params;
  const files = req.files;
  //   console.log(attachmentFiles);

  const userMember = await User.findOne({ email });

  if (!userMember) {
    throw new apiError(404, 'user not found', false);
  }

  const isMember = await ProjectMember.findOne({
    user: userMember._id,
    project: projectId,
  });

  if (!isMember) {
    throw new apiError(400, 'this user not member of Your project', false);
  }

  const task = await Task.create({
    title,
    description,
    status,
    project: projectId,
    assignedBy: req.user._id,
    assignedTo: userMember._id,
  });

  if (!files || files.length === 0) {
    throw new apiError(400, 'No files uploaded');
  }

  const uploadedFile = [];

  for (const file of files) {
    console.log(file.path);
    const cloudinaryResult = await uploadOnCloudinary(file.path);

    if (cloudinaryResult) {
      uploadedFile.push({
        url: cloudinaryResult.url,
        mimetype: file.mimetype,
        size: file.size,
      });
    }
  }

  await Task.findByIdAndUpdate(task._id, {
    $push: { attachments: { $each: uploadedFile } },
  });

  const populateTask = await Task.findById(task._id)
    .populate('assignedBy', 'fullname username')
    .populate('assignedTo', 'fullname username avatar')
    .populate('project', 'name');

  return res
    .status(201)
    .json(new apiResponse(201, populateTask, 'Task created successfully', true));
});
const getTasks = asyncHandler(async (req, res) => {});
const getTasksById = asyncHandler(async (req, res) => {});
const updateTask = asyncHandler(async (req, res) => {});
const updateTaskStatus = asyncHandler(async (req, res) => {});
const deleteTask = asyncHandler(async (req, res) => {});

const addSubTask = asyncHandler(async (req, res) => {});
const getSubTask = asyncHandler(async (req, res) => {});
const updateSubTask = asyncHandler(async (req, res) => {});
const deleteSubTask = asyncHandler(async (req, res) => {});

export { createTask, updateTask, getTasks, getTasksById, deleteTask, updateTaskStatus };

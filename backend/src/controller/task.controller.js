import { ProjectMember } from '../models/projectmember.models.js';
import { SubTask } from '../models/subtask.models.js';
import { Task } from '../models/task.models.js';
import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { apiError } from '../utils/api-error.js';
import { apiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { availableTaskStatuses } from '../utils/constants.js';

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, email } = req.body;
  const { projectId } = req.params;
  const files = req.files;
  //   console.log(attachmentFiles);

  const project = await Project.findById(projectId);

  if (!project) {
    throw new apiError(404, 'Project not found');
  }

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

  if (!files || files.length === 0) {
    throw new apiError(400, 'No files uploaded');
  }

  const uploadedFile = await Promise.all(
    files.map(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        throw new apiError(400, 'File too large (max 10MB)', false);
      }
      const cloudinaryResult = await uploadOnCloudinary(file.path);
      return {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.public_id,
        mimetype: file.mimetype,
        size: file.size,
      };
    })
  ).catch((err) => console.error('Cloudinary Error during Upload file', err));

  if (!availableTaskStatuses.includes(status)) {
    throw new apiError(400, 'Invalid status');
  }

  const task = await Task.create({
    title,
    description,
    status,
    project: projectId,
    assignedBy: req.user._id,
    assignedTo: userMember._id,
    attachments: uploadedFile,
  });

  const populateTask = await Task.findById(task._id)
    .populate('assignedBy', 'fullname username')
    .populate('assignedTo', 'fullname username avatar')
    .populate('project', 'name');

  return res
    .status(201)
    .json(new apiResponse(201, populateTask, 'Task created successfully', true));
});
const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const task = await Task.find({
    project: projectId,
  })
    .populate('assignedBy', 'fullname username')
    .populate('assignedTo', 'fullname username avatar')
    .populate('project', 'name');

  if (task.length === 0) {
    throw new apiError(404, 'project task not found', false);
  }

  return res.status(200).json(new apiResponse(200, task, 'tasks fetch successfully', true));
});
const getTasksById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate('assignedBy', 'fullname username')
    .populate('assignedTo', 'fullname username avatar')
    .populate('project', 'name');

  if (!task) {
    throw new apiError(404, 'Task not found', false);
  }

  return res.status(200).json(new apiResponse(200, task, 'task fetch successfully', true));
});
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, email } = req.body;
  const { projectId, taskId } = req.params;

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(400, 'User not Exist', false);
  }

  const task = await Task.findOne({ _id: taskId, project: projectId });

  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: user._id,
  });

  if (!task || !isMember) {
    throw new apiError(403, 'not authorized', false);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      title: title,
      description: description,
      assignedTo: user._id,
    },
    { new: true }
  )
    .populate('assignedBy', 'fullname username')
    .populate('assignedTo', 'fullname username avatar')
    .populate('project', 'name');

  return res.status(200).json(new apiResponse(200, updatedTask, 'task update successfully', true));
});
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { projectId, taskId } = req.params;

  if (!availableTaskStatuses.includes(status)) {
    throw new apiError(400, 'Invalid status', false);
  }

  const task = await Task.findOne({ _id: taskId, project: projectId });

  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  });

  if (!task || !isMember) {
    throw new apiError(403, 'Not authorized');
  }

  const updateStatusTask = await Task.findByIdAndUpdate(taskId, { status }, { new: true });

  if (!updateStatusTask) {
    throw new apiError(400, 'task not found fiel to update status', false);
  }

  return res.status(200).json(new apiResponse(200, {}, 'stutus updated', true));
});
const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findOneAndDelete({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new apiError(400, 'task not found', false);
  }

  for (const file of task.attachments) {
    await deleteFromCloudinary(file.publicId);
  }

  await task.deleteOne();

  return res.status(200).json(new apiResponse(200, {}, 'task delete successfully', true));
});

const addSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { taskId } = req.params;

  console.log(typeof isCompleted);
  

  const task = await Task.findById(taskId);
  
  if (!task) {
    throw new apiError(400, 'task is not found', );
  }

  const subTask = await SubTask.create({
    title,
    isCompleted,
    task: task._id,
    createdBy: req.user._id,
  });

  if (!subTask) {
    throw new apiError(400, 'subTask is not created', );
  }

  return res.status(200).json(new apiResponse(200, subTask, 'subtask created successfully', true));
});
const getSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new apiError(400, 'task is not found', );
  }
  
  const subTasks = await SubTask.find({ task: taskId });

  if (subTasks.length === 0) {
    throw new apiError(400, 'subtask is not found', );
  }
  
  return res.status(200).json(new apiResponse(200, subTasks, 'subtask fetched successfully', true));
});
const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { taskId , subtaskId } = req.params;

  const subtask = await SubTask.findOne({
    _id: subtaskId,
    task:taskId
  });

  if (!subtask) {
    throw new apiError(404, 'subtask is not found', );
  }

  const updatedSubTask = await SubTask.findByIdAndUpdate(
    subtask._id,
    {
      title,
      isCompleted,
    },
    { new: true }
  ).populate('createdBy', 'avatar username');
  
  if (!updatedSubTask) {
    throw new apiError(404, 'Field to update subtask ', );
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, updatedSubTask, 'SubTask update successfully', true));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;

  const subtask = await SubTask.findByIdAndDelete(subtaskId).populate(
    'createdBy',
    'avatar username'
  );

  if (!subtask) {
    throw new apiError(400, 'for some resone subtask not deleted', false);
  }

  return res
    .status(200)
    .json(new apiResponse(200, deleteSubTask, 'SubTask delete successfully', true));
});

export {
  createTask,
  updateTask,
  getTasks,
  getTasksById,
  deleteTask,
  updateTaskStatus,
  addSubTask,
  getSubTask,
  updateSubTask,
  deleteSubTask
};

import { asyncHandler } from '../utils/async-handler.js';
import { Project } from '../models/project.models.js';
import { ProjectNote } from '../models/note.models.js';
import { apiError } from '../utils/api-error.js';
import { apiResponse } from '../utils/api-response.js';
import { mongo } from 'mongoose';
import mongoose from 'mongoose';

const getNotes = asyncHandler(async (req , res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new apiError(404, 'project not found', false);
  }
  const projectNotes = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(project._id),
  }).populate('createdBy', 'fullname avatar username');

  return res.status(200).json(new apiResponse(200, projectNotes, 'note fetch succussfully', true));
});
const getNoteById = asyncHandler(async (req , res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findById(noteId).populate('createdBy', 'fullname avatar username');

  if (!note) {
    throw new apiError(404, 'Note not found', false);
  }

  return res.status(200).json(new apiResponse(200, note, 'note fetch succussfully', true));
});
const createNote = asyncHandler(async (req , res) => {
  const { content } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new apiError(404, 'project not found', false);
  }

  const note = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(project._id),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    content,
  });

  const populatedNote = await ProjectNote.findById(note._id).populate(
    'createdBy',
    'fullname avatar username'
  );

  return res
    .status(200)
    .json(new apiResponse(200, populatedNote, 'Note created succussfully', true));
});
const updateNote = asyncHandler(async (req , res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  const note = await ProjectNote.findById(noteId);

  if (!note) {
    throw new apiError(404, 'Note not found', false);
  }

  const populatedNote = await ProjectNote.findByIdAndUpdate(
    noteId,
    {
      content,
    },
    { new: true }
  ).populate('createdBy', 'fullname avatar username');

  return res
    .status(200)
    .json(new apiResponse(200, populatedNote, 'Note updated succussfully', true));
});
const deleteNote = asyncHandler(async (req , res) => {
  const { noteId } = req.params;
  const note = await ProjectNote.findByIdAndDelete(noteId);

  if (!note) {
    throw new apiError(404, 'Note not found', false);
  }

  return res
    .status(200)
    .json(new apiResponse(200, note, 'Note deleted succussfully', true));
});

export { getNotes , getNoteById , createNote , updateNote , deleteNote }

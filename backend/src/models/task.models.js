import mongoose, { Schema } from "mongoose";
import { availableTaskStatuses, TaskStatusEnum } from '../utils/constants.js'
const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true , 'user ref is required'], // for custom messages if you want to send 
    },
    status: {
        type: String,
        enum: availableTaskStatuses,
        default: TaskStatusEnum.TODO,
        required: true
    },
    attachments: {
        type: [
            {
                url: String,
                mimetype: String,
                size: Number
            }
        ],
        default: []
    }


}, { timeseries: true })

export const Task = mongoose.model('Task', taskSchema)
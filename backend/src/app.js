import express, { json, urlencoded } from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'
const app = express()

// router imports
import healthcheckRouter from './routes/healthcheck.routes.js'
import userRouter from './routes/auth.routes.js'
import {  apiResponse } from './utils/api-response.js'
import projectRouter from './routes/project.routes.js'
import noteRouter from './routes/note.routes.js'
import taskRouter  from './routes/task.routes.js'

// express configuration 

app.use(express.urlencoded({ extended: true}))
app.use(express.json({ limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

// cors configurataion
app.use(cors({
    // origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    origin:'*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE' , 'OPTIONS'],
    credentials:true,
    allowedHeaders:['Content-Type' , 'Authorization ']

}))

// import the routes

app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/userAuth', userRouter)
app.use('/api/v1/project', projectRouter)
app.use('/api/v1/note', noteRouter)
app.use('/api/v1/task', taskRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = new apiResponse(statusCode, err.errors || [], err.message || 'Internal Server Error')

    res.json(response)
});

export default app
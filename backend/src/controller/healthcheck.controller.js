import { apiResponse } from '../utils/api-response.js'

const healthcheck = async (req, res) => {
    console.log('loog to hit healthchekc');
    
    res.status(200).json(
        new apiResponse(200, { message: 'Server is runing' })
    )
}

export { healthcheck }
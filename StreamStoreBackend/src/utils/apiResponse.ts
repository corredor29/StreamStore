import { Response } from "express"

export const success = (res: Response, message: string, data: unknown = null, status = 200) => {
    return res.status(status).json({ message, data })
}

export const failure = (res: Response, error: unknown, status = 400) => {
    return res.status(status).json({ error })
}

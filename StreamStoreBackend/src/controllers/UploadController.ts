import { Request, Response } from "express"
import { config } from "../config/config"
import { CARPETA_PORTADAS } from "../middlewares/UploadMiddleware"
import { ApiResponse } from "../utils/apiResponse"
import { HttpError } from "../utils/httpError"

export class UploadController {
    static subirPortada(req: Request, res: Response) {
        try {
            if (!req.file) throw new HttpError('Envía la imagen como multipart/form-data en el campo "imagen"', 400)
            const ruta = `/uploads/${CARPETA_PORTADAS}/${req.file.filename}`
            return ApiResponse.created(res, "Imagen subida", {
                url: `${config.publicUrl}${ruta}`,
                ruta,
                nombre_original: req.file.originalname,
                tipo: req.file.mimetype,
                tamano: req.file.size
            })
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}

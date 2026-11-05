import crypto from "crypto"
import fs from "fs"
import path from "path"
import { NextFunction, Request, Response } from "express"
import multer from "multer"
import { config } from "../config/config"
import { ApiResponse } from "../utils/apiResponse"
import { HttpError } from "../utils/httpError"

const EXTENSIONES: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
}

export const uploadsDir = path.resolve(config.uploads.dir)
export const CARPETA_PORTADAS = "portadas"

const destino = path.join(uploadsDir, CARPETA_PORTADAS)
fs.mkdirSync(destino, { recursive: true })

const upload = multer({
    storage: multer.diskStorage({
        destination: destino,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${EXTENSIONES[file.mimetype]}`)
    }),
    limits: { fileSize: config.uploads.maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => EXTENSIONES[file.mimetype]
        ? cb(null, true)
        : cb(new HttpError("Solo se permiten imágenes JPG, PNG, WEBP o GIF", 415))
})

// El mimetype lo declara el cliente; se confirma con la firma real del archivo
const esImagenReal = (ruta: string, mimetype: string) => {
    const fd = fs.openSync(ruta, "r")
    const b = Buffer.alloc(12)
    try {
        fs.readSync(fd, b, 0, 12, 0)
    } finally {
        fs.closeSync(fd)
    }
    switch (mimetype) {
        case "image/jpeg": return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
        case "image/png": return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        case "image/gif": return b.subarray(0, 4).toString("ascii") === "GIF8"
        case "image/webp": return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP"
        default: return false
    }
}

export const uploadImagen = (campo: string) => (req: Request, res: Response, next: NextFunction) =>
    upload.single(campo)(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") return ApiResponse.error(res, new HttpError(`La imagen supera ${config.uploads.maxMb} MB`, 413))
            if (error.code === "LIMIT_UNEXPECTED_FILE") return ApiResponse.error(res, new HttpError(`Envía una sola imagen en el campo "${campo}"`, 400))
            return ApiResponse.error(res, new HttpError(`Archivo inválido: ${error.message}`, 400))
        }
        if (error) return ApiResponse.error(res, error)
        if (req.file && !esImagenReal(req.file.path, req.file.mimetype)) {
            fs.rm(req.file.path, { force: true }, () => undefined)
            return ApiResponse.error(res, new HttpError("El archivo no es una imagen válida", 415))
        }
        next()
    })

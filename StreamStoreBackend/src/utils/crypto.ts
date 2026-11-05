import crypto from "crypto"
import { config } from "../config/config"

const key = crypto.createHash("sha256").update(config.aesSecret).digest()

export const encrypt = (plain: string) => {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
    const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
    return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${data.toString("hex")}`
}

export const decrypt = (payload: string) => {
    const [iv, tag, data] = payload.split(":")
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"))
    decipher.setAuthTag(Buffer.from(tag, "hex"))
    return Buffer.concat([decipher.update(Buffer.from(data, "hex")), decipher.final()]).toString("utf8")
}

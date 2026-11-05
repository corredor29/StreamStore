// Levanta backend y frontend juntos: `npm run dev` desde la raíz. Ctrl+C detiene ambos.
const { spawn, spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const proyectos = ["StreamStoreBackend", "StreamStoreFrontend"]

const sinDependencias = proyectos.filter((carpeta) => !fs.existsSync(path.resolve(__dirname, carpeta, "node_modules")))
if (sinDependencias.length) {
    console.error(`Faltan dependencias en: ${sinDependencias.join(", ")}. Corre primero: npm run install:all`)
    process.exit(1)
}

const hijos = proyectos.map((carpeta) =>
    spawn("npm run dev", { cwd: path.resolve(__dirname, carpeta), shell: true, stdio: "inherit" }))

let cerrando = false
const detener = (codigo) => {
    if (cerrando) return
    cerrando = true
    for (const hijo of hijos) {
        if (hijo.exitCode !== null) continue
        // En Windows, kill() solo cierra la shell: taskkill /T baja también node/vite
        if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(hijo.pid), "/T", "/F"], { stdio: "ignore" })
        else hijo.kill("SIGINT")
    }
    process.exit(codigo)
}

hijos.forEach((hijo, i) => hijo.on("exit", (codigo) => {
    if (cerrando) return
    console.error(`\n${proyectos[i]} terminó (código ${codigo}); deteniendo el otro proceso.`)
    detener(codigo ?? 1)
}))
process.on("SIGINT", () => detener(0))
process.on("SIGTERM", () => detener(0))

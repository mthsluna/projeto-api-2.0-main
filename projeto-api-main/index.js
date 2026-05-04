const express = require('express')
const cors = require('cors')
const os = require('os')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/system', (req, res) => {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const files = fs.readdirSync(process.cwd()).map(f => {
    const stat = fs.statSync(path.join(process.cwd(), f))
    return { name: f, type: stat.isDirectory() ? 'Dir' : 'Arquivo', size: stat.isDirectory() ? '-' : (stat.size / 1024).toFixed(2) + ' KB' }
  })
  res.json({
    sistema: { host: os.hostname(), so: os.type(), release: os.release(), plataforma: os.platform(), arquitetura: os.arch(), endianness: os.endianness(), node: process.version },
    usuario: { usuario: os.userInfo().username, home: os.userInfo().homedir, shell: os.userInfo().shell, uid: os.userInfo().uid, gid: os.userInfo().gid },
    memoria: { total: (totalMem/1e9).toFixed(2), usada: (usedMem/1e9).toFixed(2), livre: (freeMem/1e9).toFixed(2), porCPU: (usedMem/cpus.length/1e9).toFixed(2), percentual: Math.round((usedMem/totalMem)*100) },
    cpu: { nucleos: cpus.length, modelo: cpus[0].model, loadAvg: os.loadavg().map(v => v.toFixed(2)), cores: cpus.map((c,i) => ({ id: i, pct: Math.round(100 - (c.times.idle / Object.values(c.times).reduce((a,b) => a+b,0)) * 100) })) },
    rede: { interfaces: Object.entries(os.networkInterfaces()).flatMap(([name,addrs]) => addrs.map(a => ({ if: name, ip: a.address, familia: a.family }))) },
    tempo: { uptime: os.uptime(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, iso: new Date().toISOString() },
    aplicacao: { pid: process.pid, diretorio: process.cwd(), memoriaNode: (process.memoryUsage().heapUsed/1e6).toFixed(2), execPath: process.execPath },
    ambiente: { nodeEnv: process.env.NODE_ENV || 'development', port: process.env.PORT || 3000 },
    arquivos: files
  })
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT))

const fs = require('fs')
const file = 'demo.mp4'


fs.stat(file, (err, stat) => {
    let total = stat.size
    let progress = 0
    let read = fs.createReadStream(file)
    let write = fs.createWriteStream('copy2.mp4')
    let write2 = fs.createWriteStream('copy3.mp4')

    read.on('data', (chunk) => {
        progress += chunk.length
        if (progress !== 0)
            console.log(((progress / total) * 100).toFixed(2) + '%')
    })
	read.pipe(write)
	read.pipe(write2)
    write.on('finish', () => {
        console.log("Le fichier 1 a bien ete copie")
    })
    write2.on('finish', () => {
        console.log("Le fichier 2 a bien ete copie")
    })
})


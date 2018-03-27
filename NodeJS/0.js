
const http = require('http')
const fs = require('fs')
const url = require ('url')
const EventEmitter = require('events')

const hostname = 'Victor'
const port = 3000


const App = {
  start: function () {
    let emitter = new EventEmitter()
    let server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-type': 'text/html; charset=utf-8'
      })
      if (req.url === '/') {
        emitter.emit('root', res)
      }
      res.end()
    }).listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    })
    return emitter
  }
}

let app = App.start()
app.on('root', function (res) {
  res.write('Je suis a la racine mamene')
})


/*
const server = http.createServer()
server.on('request', (req, res) => {
  res.writeHead(200)

  let query = url.parse(req.url, true).query
  let name = query.name === undefined ? 'Anonymous' : query.name

  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Ce fichier n\'existe pas bro!')
    } else {
      res.writeHead(200, {
        'Content-type': 'text/html; charset=utf-8'
      })
      data = data.replace('{{ name }}', name)
      res.end(data)
    }
  })
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/
/*
const hostname = '127.0.0.1';
const port = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/
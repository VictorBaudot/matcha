const http = require('http')
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

module.exports = App
var EventEmitter = require('events').EventEmitter;

var jeu = new EventEmitter();

jeu.on('gameover', function(message, m2){
    console.log(message+" "+m2);
});

jeu.emit('gameover', 'Vous avez perdu !', 'lol');

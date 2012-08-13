/*
 * Chat
 */

var mongo = require('mongodb'),
    db = new mongo.Db('test', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT,{}), {}),
    clients = [],
    colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];


var request = function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  var connection = request.accept(null, request.origin);
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  
  console.log((new Date()) + ' Connection accepted.');
  
  db.open(function() {
    db.createCollection('comments', function(err, collection) {
      collection.find({}, {
        time: true,
        unixtime: true,
        text: true,
        author: true,
        color: true
      }, {'limit':20}).toArray(function(err, docs){
        connection.sendUTF(JSON.stringify({type: 'history', data: docs}));
        db.close();
      });
    });
  });
  
  // we'll handle all messages from users here
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
      if (userName === false) {
        userName = (message.utf8Data);
        userColor = colors.shift();
        connection.sendUTF(JSON.stringify({type: 'color', data: userColor}));
        console.log((new Date()) + ' User is known as: ' + userName +
                    ' with ' + userColor + ' color.');
      } else {
        console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.utf8Data);
        var obj = {
          time: (new Date()).getTime(),
          unixtime: (new Date())/1000,
          text: message.utf8Data,
          author: userName,
          color: userColor
        };
        
        // add to comments collection
        db.open(function() {
          db.collection('comments', function(err, collection) {
            collection.insert(obj);
            console.log((new Date()) + ' DB insert.');
            db.close();
          });
        });
        
        // broadcast message to all connected clients
        var json = JSON.stringify({type: 'message', data: obj});
        for (var i = 0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    }
  });
  
  connection.on('close', function(connection) {
    // close user connection
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + ' Peer ' +
                  connection.remoteAddress + ' disconnected.');
      clients.splice(index, 1);
      colors.push(userColor);
    }
  });
};

exports.request = request;

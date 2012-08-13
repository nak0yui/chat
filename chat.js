/*
 * Chat
 */

var history = [],
    clients = [],
    colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];


var request = function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  var connection = request.accept(null, request.origin);
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  
  console.log((new Date()) + ' Connection accepted.');
  
  if (history.length > 0) {
    connection.sendUTF(JSON.stringify({type: 'history', data: history}));
  }
  
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
          text: message.utf8Data,
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);
        
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




/*
 * Chat
 */

var
mongoose = require('mongoose'),
comment = require('./schema/comment.js'),
colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ],
history = [],

Comment = mongoose.model('Comment', comment.schema);
mongoose.connect('mongodb://localhost/test');

exports.connection = function(socket) {
  console.log((new Date()) + ' Connection from ' + socket + '.');
  var
  userName = false,
  userColor = false;
  
  Comment.find({}, function(err, docs) {
    if (docs.length > 0) {
      socket.emit('history', {data: docs});
    }
  });
  
  if (history.length > 0) {
    socket.emit('history', {data: history});
  }
  
  socket.on('name', function(data) {
    userName = data.name;
    userColor = colors.shift();
    socket.emit('name', {name: userName});
    socket.emit('color', {color: userColor});
    console.log((new Date()) + ' User is known as: ' + userName +
                ' with ' + userColor + ' color.');
  });
  
  socket.on('message', function(data) {
    var
    obj = {
      time: (new Date()).getTime(),
      unixtime: (new Date())/1000,
      text: data.text,
      author: userName,
      color: userColor
    },
    comment = new Comment(obj);
    comment.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('comment save: ' + obj.text);
      }
    });
    history.push(obj);
    socket.emit('message', {data: obj});
    socket.broadcast.emit('message', {data: obj});
  });
  
  socket.on('disconnect', function() {
    console.log('disconnect');
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + ' Peer ' +
                  'connection disconnected.');
      colors.push(userColor);
    }
  });
  
};

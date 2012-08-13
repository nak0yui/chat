(function($) {
  'use strict';
  
  $(function() {
    var
    socket = io.connect('http://localhost:3000/'),
    $content = $('#content'),
    $input = $('#input'),
    $status = $('#status'),
    $form = $('#form'),
    myColor = false,
    myName = false,
    readHistory = true,
    error = function() {
      $content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                               + 'connection or the server is down.' } ));
      $input.attr('disabled', 'disabled');
    },
    addMessage = function(data) {
      var date = new Date(data.time);
      $content.append(
        $('<p>').append(
          $('<span>').css('color', data.color).text(data.author)
        ).append(
          ' @ ' +
            (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +
            (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' +
            (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + ': ' +
            data.text
        )
      );
    };
    
    socket.on('connect', function() {
      $input.removeAttr('disabled');
      $status.text('Input name:');
    });
    
    socket.on('connect_failed', error);
    socket.on('error', error);
    
    socket.on('history', function(data) {
      if (readHistory) {
        $.each(data.data, function() {
          addMessage(this);
        });
        readHistory = false;
      }
    });
    
    socket.on('color', function(data) {
      myColor = data.color;
      $status.css('color', myColor);
    });
    
    socket.on('name', function(data) {
      myName = data.name;
      $status.text(myName + ': ');
    });
    
    socket.on('message', function(data) {
      addMessage(data.data);
    });
    
    $form.submit(function() {
      var msg = $input.val();
      if (!msg) {
        return false;
      }
      if (myName) {
        socket.emit('message', {text: msg});
      } else {
        socket.emit('name', {name: msg});
      }
      $input.val('');
      return false;
    });
  });
})(window.jQuery);

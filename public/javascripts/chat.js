// Client
$(function() {

  var socket = io.connect('http://localhost');

  socket.on('connect', function() {
    socket.emit('msg update');
  });

  $('#btn').click(function() {
    var message = $('#message');
    socket.emit('msg send', message.val());
  });

  $('#delete').click(function(){
    socket.emit('deleteDB');
  });

  socket.on('msg push', function (msg) {
    var date = new Date();
    $('#list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>'));
  });


  //接続されたらDBにあるメッセージを表示
  socket.on('msg open', function(msg){
    //DBが空っぽだったら
    if(msg.length == 0){
        return;
    } else {
      $('#list').empty();
      $.each(msg, function(key, value){
        $('#list').prepend($('<dt>' + value.date + '</dt><dd>' + value.message + '</dd>'));
      });   
    }
  });

  //DBにあるメッセージを削除したので表示も消す
  socket.on('db drop', function(){
    $('#list').empty();
  });

});

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//mongoose
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  name:  String,
  message: String,
  date: Date
});
mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/chat_app');
var User = mongoose.model('User');

//socket
var log = function(){ console.log(arguments); };

// Server
var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket) {
  socket.on('msg update', function(){
    //接続したらDBのメッセージを表示
    User.find(function(err, docs){
      socket.emit('msg open', docs);
    });
  });

  log('connected');

  socket.on('msg send', function (msg) {
    socket.emit('msg push', msg);
    socket.broadcast.emit('msg push', msg);
    //DBに登録
    var user = new User();
    user.message  = msg;
    user.date = new Date();
    user.save(function(err) {
      if (err) { console.log(err); }
    });
  });

  //DBにあるメッセージを削除
  socket.on('deleteDB', function(){
    socket.emit('db drop');
    socket.broadcast.emit('db drop');
    User.find().remove();
  });

  socket.on('disconnect', function() {
    log('disconnected');
  });
});
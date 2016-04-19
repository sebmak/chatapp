var io = require('socket.io')(8000);
var shortid = require('shortid');
var AJAX = require('superagent');

var express = require('express');
var app = express();

var users = {};
var messages = [];

app.use(express.static(__dirname + "/public"));

app.get('*', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.listen(3000);

function RAND(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var plugins = {
    pointingpoker: function PointingPoker(socket, data) {
        var params = /(\S+)$/i.exec(data.message.text);
        var thisId = shortid.generate();

        var points = {
            "0": 0,
            "0.25": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "5": 0,
            "8": 0,
            "?": 0
        }

        var getHighest = function(p) {
            var r = 0;
            var h = '';
            for(var k in p) {
                if(p[k] > h) {
                    h = k;
                }
            }
            return h;
        }

        AJAX
          .get('http://atl11.int.mywedding.com:8080/rest/api/latest/issue/' + params[0])
          .end(function(err, res){
              if(err) {
                  console.log(err);
                  socket.emit('message', {message: err.response});
                  return;
              }

              var response = {
                  id: thisId,
                  options: {
                      "0": "0",
                      "0.25": "1/4",
                      "1": "1",
                      "2": "2",
                      "3": "3",
                      "5": "5",
                      "8": "8",
                      "?": "?"
                  },
                  points: points,
                  data: res.body
              }

              var index = messages.push({
                  type: "plugin",
                  pluginName: "pointingpoker",
                  data: response
              });

              socket.emit('message', {
                  type: "plugin",
                  pluginName: "pointingpoker",
                  data: response
              });

              socket.broadcast.emit('message', {
                  type: "plugin",
                  pluginName: "pointingpoker",
                  data: response
              });

              io.of('/plugin/pointingpoker/' + thisId).on('connection', function(s) {

                  s.on('vote', function(val) {
                      points[val]++;
                      s.broadcast.emit('vote', val);
                  });

                  s.on('unvote', function(val) {
                      points[val]--;
                      s.broadcast.emit('unvote', val);
                  })

                  s.on('close', function() {
                      messages[index-1] = {
                          user: {id: "system"},
                          message: {
                              text: response.data.key + " | " + getHighest(points)
                          }
                      }

                      socket.emit('replaceMessage', {index: index-1, message: messages[index-1]});
                      socket.broadcast.emit('replaceMessage', {index: index-1, message: messages[index-1]});
                  })
              })
          });
    },
    gify: function Gify(socket, data) {
        var params = /(\s\S+)/i.exec(data.message.text);
        AJAX
          .get('http://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(params[0]).replace(/%20/g, '+') + '&api_key=dc6zaTOxFJmzC')
          .end(function(err, res){
              if(err || res.body.data.length === 0) {
                  console.log(err);
                  socket.emit('message', {message: err.response});
                  return;
              }

              var img = res.body.data[RAND(0, res.body.data.length)];

              messages.push({
                  type: "plugin",
                  pluginName: "gify",
                  data: img
              });
                socket.emit('message', {
                    type: "plugin",
                    pluginName: "gify",
                    data: img
                });

                socket.broadcast.emit('message', {
                    type: "plugin",
                    pluginName: "gify",
                    data: img
                });
          });

    }
}

io.on('connection', function(socket) {
    socket.on('connected', function(user) {
        console.log(user + " Connected");
        var id = shortid.generate();

        users[id] = {id: id, name: user};

        socket.broadcast.emit('joined', users[id]);

        socket.emit('connected', {user: users[id], messages: messages});

        socket.on('send', function(data) {
            var match = /^\/([a-z0-9]+)(\s|$)/i.exec(data.message.text)
            if(match && typeof plugins[match[1]] === 'function') {
                new plugins[match[1]](socket, data);
            } else {
                messages.push(data);
                socket.broadcast.emit('message', data);
                socket.emit('message', data);
            }
        });

        socket.on('disconnect', function() {
            console.log(users[id].name + " Has Left");
            socket.broadcast.emit('left', users[id]);
            delete users[id];
        })
    });
})

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var loginDb = require('./db');
var cors = require('cors')
var levelup = require('levelup')
var netMembersDb = levelup('./netMembersDb5', {valueEncoding:'json'})
var netContentsDb = levelup('./netContentsDb5', {valueEncoding:'json'})
var recordsDb = levelup('./recordsDb49', {valueEncoding: 'json'})
var accessDb = levelup('./accessDb3')
var groupsDb = levelup('./groupsFlintDb3')
var netsDb = levelup('./netsDb5')
var netListDb= levelup('./netListDb5')

var body = require('body/any')
var h = require('hyperscript')
var hyperstream = require('hyperstream')
var fs = require('fs')

var app = express();

var server = app.listen(3000, function(){
  console.log('listening on port 3000')
})
var path = require('path')


//BETTER DATA STRUCTURE 
//key: network, 
//value is an array of objects, each object is a node with 
//specific properties...group property searched to highlight
//and group like nodes (node can be in more than one group in a network)
// value: [{
//     nodeName : nodeName,
//       group: group,
//     position: {x, y},
//     edges: {in: [inEdge1,inEdge2,.....], out: [outEdge]},
//     edge: [[inEdge, inEdge],[outEdge,outEdge]
//}]

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-locals'));


var corsOption = {
  origin: 'http://ourlifenet.com'
}
var collect = require('collect-stream')

app.use(express.static('public'))

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb' with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {

    recordsFindByUsername(username, function(err, user){
      if (err) { 
        console.log('oh1');
        return cb(err); 
      }
      if (!user) { console.log('oh2');
      return cb(null, false); 
      }
      if (user.password != password) { 
        console.log('oh3');
      return cb(null, false); 
      }
      console.log('ohyeaaa', user)

      return cb(null, user);
    })

}));


function recordsFindByUsername (username,cb) {
  recordsDb.get(username, function(err,value){
    if (err) {
      console.log('uhhhhh', err)
      return cb(null,null)
    }
    else {
      console.log('wooooopppp', value)
      value.username = username
      console.log('hopppy', value)
      return cb(null, value)
    }
  })
}


/*      var foundArrayItem = {}
      value.forEach(function(arrayItem){
        console.log('authenticating???', arrayItem, 'and', arrayItem.username,' and', username)
        if (arrayItem.username === username) {
          console.log('allright')
          foundArrayItem=arrayItem
        } 
      })
      if (foundArrayItem === {}){
        console.log('do1')
        return cb(null,null)
      }
      else {
        console.log('do2')*/


/*passport.use(new Strategy(
  function(username, password, cb) {
    User.findOne(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { 
        usr = new User ({username:username, password:password})
        usr.save(function(err){
          if (err) {
            console.log(err)
          } 
          else {
            console.log('User: '+ usr.username + ' saved.')
          }
      })
      }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));
*/



// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  recordsFindById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


function recordsFindById (id, cb){
  
  console.log('lookinfor', id)
  var data2 ={}
  recordsDb.createValueStream()
    .on('data', function(data){
      console.log('hhh@', data)
      console.log('isthisthis',data.id, id)
      if (data.id === id){
        console.log('booya!')
        var data2= data
        console.log('genius!', data2)
      }
      console.log('nope')
    })
  if (data2 != {}) {
    console.log('coool',data2)
    return cb(null,data2)
  }
  else{
    return cb(new Error('User' +id + 'does not exist'))
  }
}

  /*recordsDb.get('records', function(err,value){
    if (err) {
      console.log('uhhhhh', err)
    }
    else {
      var foundArrayItem = {}
      value.forEach(function(arrayItem){
        console.log('authenticating???', arrayItem, 'and', arrayItem.id,' and', id)
        if (arrayItem.id === id) {
          console.log('allright')
          foundArrayItem=arrayItem
        } 
      })
      if (foundArrayItem === {}){
        console.log('do1')
        return cb(new Error('User' +id + 'does not exist'))
      }
      else {
        console.log('do2')
        return cb(null, foundArrayItem)
      }
    }
  })
}*/


// Create a new Express application.
var io = require('socket.io')(server)
//socket is the object that is assigned to a new client (their connection)
io.on('connection',function(socket){
  //emits what was received from socket to all on connection
  socket.on('news', function (data){
    io.emit('news', data)
  })
})



// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });


app.get('/login',
  function(req, res){
    res.render('login');
  });
  


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login'}),
  function(req, res, next) {
/*    res.redirect('/');

*//*console.log('sending index')
res.sendFile(path.join(__dirname, '/public', 'index.html'));
*/
  console.log('req.user!!WOOOO', req.user, 'and')
    req.session.user= req.user
    res.redirect('/home2')
    console.log('ok')
  }

);
  


app.get('/logout',
  function(req, res){
    req.logout();
    
    res.render('login')
    res.redirect('/');

/*    res.render('/login')
*//*    res.sendFile(path.join(__dirname, '/protected', 'index.html'));
    res.end()
    res.render('/')*/

  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    console.log('dope!', req.user)
    console.log('ahhhh', req)
    res.render('profile', { user: req.user });
  });

app.get('/home2', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req,res){
    console.log('oooop!', req.session.user)
    res.sendFile(path.join(__dirname, '/protected', 'home.html'));
  }
)

app.get('/signUp', function (req,res){
  res.render('signUp')
})


app.post('/signUp3', function(req,res){
    var username1 = req.body.username
    var password1 = req.body.password
    var email1 = req.body.email
 
    console.log('hi1')

    var counter = 0
    recordsDb.createReadStream()
      .on('data', function(data){
        counter ++;
        console.log('myCount', counter)
      })

    counter ++;
    console.log('myCount2', counter)

    recordsDb.get(username1, {'sync':true}, function(err,value){
      if (err) {
       
        if(err.notFound){          
          console.log('counter and', counter)

             var body = {
              username: username1,
              id: counter,
              password: password1,
              emails: email1
             }

          recordsDb.put(username1, body, function(err,value){
            recordsDb.get(username1, function(err,value){
              if (err) {return console.log('crap', err)}
              else {
                console.log('pppp',value)
                
                  recordsDb.createReadStream()
                    .on('data', function(data){
                    console.log('woot', data)
                  })


                res.render('login', {
                  message:'hppp '
                })
              }
            })
          })  
        }
      }
      else {
        alert('Username already taken...please choose another!')
        res.render('signUp')
      }
    })

})


app.get('/loadRecords', function(req,res,next){
   var stream = recordsDb.createReadStream()
    collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/checkDb/:net',function(req,res,next){
  db.get(req.params.net, function(err,value){
    console.log('currently selected Net includes::::::::',value)
  })
})

app.get('/enterChat', function(req,res,next){
  res.sendFile('http://www.ourlifenet.com/public/chat.html')
})


app.get('/nodeInfo/:currentNet/:nodeName', function(req,res, next){
  var currentNet = req.params.currentNet
  var nodeName = req.params.nodeName
  
  console.log('hiii', currentNet, 'annnd', nodeName)
  db.get(currentNet, function(err,value){
    
    if (err) console.log(err)
    
    else {
      value.forEach(function(arrayItem){
        if (arrayItem === nodeName) {
          res.render('nodeInfoForm', {pageContent:arrayItem.group})
        }
      })
    }
  })
})

app.get('/graphSpecificGroup/:key', function(req,res){
  var group = req.params.key
  console.log('heres my comparison', group)


  var finalDataArray= []

  db.createReadStream()
  .on('data', function(data){
    var array = data.value.split(',')
    if (array[0] === group) {
      console.log('woootyyyy',array[0], array[1], array[2])
      console.log('ohhhyea', data, typeof data)
    finalDataArray.push(data) 
    console.log('updated array', finalDataArray)
    }
  })

  .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      console.log('Stream ended')
    res.end(JSON.stringify(finalDataArray))

    })
})

app.get('/graphSpecificNet/:key', function(req,res){
  var net= req.params.key

  var finalDataArray2= []
  netContentsDb.get(net, function(err,value){
    if(err){
      if (err.notFound){
        console.log('not found')
        return
      }
      return callback(err)
    }
    else {
      console.log('yessssss', value)
      
      res.end(JSON.stringify(value))

    }
  })
})


app.get('/loadGroups', cors(corsOption), function (req,res,next){
  var stream = groupsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadNets3', cors(corsOption), function (req,res,next){
  var stream = netsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadNets', cors(corsOption), function (req,res,next){
  var currentUser= req.session.user.username
  console.log('I am: ', currentUser)



  var stream = recordsDb.createReadStream({gte: currentUser, limit:1})
    console.log('fixin')
    collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 

 /* recordsDb.get(currentUser, function(err,value){
    console.log('bingding', value) 
    res.writeHead(200, {'content-type': 'application/JSON'})
    res.end(JSON.stringify(value.nets))
  })*/

/*  var stream = recordsDb.createReadStream({gt: currentUser, limit:1})
    collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
  */
  /*var finalDataArray= []
  var stream = db.createKeyStream() 
  .on('data', function(data){
    console.log('aaaa',data)
    finalDataArray.push(data) 
    console.log('bbb',finalDataArray)
  })

  .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      console.log('Stream ended', finalDataArray)
    
    res.end(JSON.stringify(finalDataArray))

    })*/
})


app.post('/addGroup', cors(corsOption), function (req,res,next){
  body(req,res,function(err,params){
    var group= params.nodeGroup
    var node = params.nodeName

    groupsDb.get(group, function(err,value){
      if (err){
        if (err.otFound){
          groupsDb.put(group, node, function(err){
            if (err) console.log(err)
          })
        }
        else console.log('uhoh',err)
      }
      else {
        value+=','+node
          groupsDb.put(group,value, function(err){
            if (err) console.log(err)
          })
      }
    })
  })
  res.end()
})

/*app.post('/addNet', cors(corsOption), function (req,res,next){
  body(req,res,function(err,params){
    var netName= params.netName

    netsDb.get(netName, function(err,value){
      if (err){
        if (err.notFound){
          netsDb.put(netName, node, function(err){
            if (err) console.log(err)
          })
        }
        else console.log('uhoh',err)
      }
      else {
        value+=','+node
          netsDb.put(group,value, function(err){
            if (err) console.log(err)
          })
      }
    })
  })
  res.end()
})*/

app.post('/addNet', cors(corsOption), function(req,res,next){
  console.log('ofcourse', req.session.user, req.session.user.username)
  body (req,res, function(err,params){
    var netName = params.netName
    var description = params.netDescription
    var invitePeople = params.invitePeople
    console.log('piiiipppy!', req.user)
    var currentUser= req.session.user.username
   
    netMembersDb.put(netName, [currentUser], function (err){
      if(err){
        return console.log(err)
      }
      else { 
        netMembersDb.get(netName, function(err,value){
          console.log('inNetdatabase!', value)
        })
      }
    })

    netContentsDb.put(netName, [{}], function(err){
      if (err){return console.log(err)}
    })

    recordsFindByUsername(currentUser, function (err, user) {
      if (err){console.log(err)}
      else {console.log('fuckyea!', user)}
      
      if (user.nets) {
         user.nets.push(netName)
      }
      else {
      user.nets = [netName]
      }


      console.log('reaaallly doing it', user)

      recordsDb.put(currentUser, user, function(err){
            if(err) {return console.log(err)}
            else {
              recordsDb.get(currentUser, function(err,value){
                console.log('the big checkerooo', value)
              })
            }
      })
    })
  })
  res.end()
})



app.get('/graphAllNodes', cors(corsOption), function(req,res,next){
  var stream = netContentsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application/JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.get('/loadEdges', cors(corsOption), function(req,res,next){
  var stream = netContentsDb.createReadStream()
  collect(stream, (err,data) => {
    res.writeHead(200, {'content-type': 'application//JSON'})
      res.end(JSON.stringify(data))
    }) 
})

app.post('/addNode', cors(corsOption), function(req,res,next){
  body(req,res, function(err,params){
    var net= params.network    
    var name = params.nodeName
    var groups = params.nodeGroup 
    var initPosition = params.position

    //TODO: parse nets to see if we're adding multiple nets or just one

    netContentsDb.get(net, function(err,value){
      if (err) {
        if (err.notFound){
          var arrayOfObjects = []
          var nodeObj = {} 
            nodeObj.nodeName = name;
            nodeObj.group = groups;
            nodeObj.position=initPosition;
            nodeObj.edges = {in:[],out:[]}

          arrayOfObjects.push(nodeObj);
          console.log('xxx', nodeObj, arrayOfObjects)
          // array.push([])
          // var inEdges= array[0]
          // var outEdges=array[1]
          // outEdges.push('!'+params.secondNode)

        netContentsDb.put(net, arrayOfObjects, function(err){
            if(err) return console.log(err)
            else {
              netContentsDb.get(net, function(err,value){
                console.log('the big addNode check for db', value)
              })
            }
          })
        }
        
        else {console.log(err)}

      }

      else{
        var arrayOfObjects2=value
        var nodeObj= {}
          nodeObj.nodeName=name
          nodeObj.group = groups
          nodeObj.position=initPosition
          nodeObj.edges = {in:[],out:[]}


        arrayOfObjects2.push(nodeObj)
        netContentsDb.put(net, arrayOfObjects2, function(err){
          if (err) {console.log('nooo',err)}
          else {
            netContentsDb.get(net, function(err,value){
                console.log('the big addNode check for db of saamme net', value)
            })
          }
        })

      }  
    })
  })
  res.end()
})

app.post('/test', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    
    console.log('wooooooo!')
    edgesDb.get(params.firstNode, function(err,value){
      console.log('firstNode', value)
    })
    edgesDb.get(params.secondNode, function(err,value){
      console.log('secondNode', value)
    })
  })
})
//need to make edgesDb key: node, value: [[inEdge, inEdge],[outEdge,outEdge]]
app.post('/addEdge', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    console.log('in Node out Node',params)

    netContentsDb.get(params.net, function(err,value){

      
      var updatedValue = value
      console.log('this is my original updated value', updatedValue, 'and', typeof updatedValue)


/*      value.forEach(function(arrayItem){
*/      
      for (var i = 0; i < value.length; i++) {
        if (value[i].nodeName === params.firstNode){

          console.log('valuei', value[i], 'and updatedValuei ', updatedValue[i])
          updatedValue[i].edges.out.push(params.secondNode)
          console.log('this is what i did: ', updatedValue)
          console.log('and this is out: ', updatedValue[i].edges.out)
        }

        if (value[i].nodeName === params.secondNode){

          console.log('implement secondNode in matching here')

          console.log('valuei222', value[i], 'and updatedValuei22 ', updatedValue[i])
          updatedValue[i].edges.in.push(params.firstNode)
          console.log('this is what i did 2222: ', updatedValue)
          console.log('and this is in 222: ', updatedValue[i].edges.out)
      
        }
        else{console.log('didnt match nothing')}

      }
      netContentsDb.put(params.net, updatedValue, function(err){
        console.log('oooh no', err)
        console.log('successfully updated')
      })
    })
  })

  res.end()
})


app.post('/savePositions', cors(corsOption), function(req,res,next){
  body(req,res,function(err,params){
    var positionObject = params.positionObject
    var nodeName1 = params.name
  
    netContentsDb.get(params.currentNet, function(err,value){
      console.log('wwwwwwwwwwwwwwwwwwwww', value, typeof value)
      var arrayOfObjects = value
      
      value.forEach(function(arrayItem){
        if (arrayItem.nodeName === nodeName1){
          console.log('fuuuuuuuuk', arrayItem.nodeName, nodeName1)
          arrayItem.position=positionObject
/*          arrayOfObjects.push(arrayItem)
*/        }
        else{
          /*arrayOfObjects.push(arrayItem)
          console.log('poooooooop', arrayOfObjects, 'then', arrayItem,'annnnd',arrayItem.nodeName, nodeName1)
*/
        console.log('dont change this nodes position its not time')
        }
      })

      netContentsDb.put(params.currentNet, value/*arrayOfObjects*/, function(err){
        console.log('did it')
      })

      netContentsDb.get(params.currentNet, function(err,value){
        console.log('thebiiiiiiiiiiiiiig check', value)
      })
    })  
  })
  res.end()
})

var express        =        require("express");
var bodyParser     =        require("body-parser");
var app            =        express();
var result         =       {};
var THIRTY_MINUTES = 30 * 60 * 1000; /* ms */
var pubsub         =       require("pubsub-js");
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = __dirname + "/build/static/"


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use('/static', express.static('build'))
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.listen(8080,function(){
  console.log("Started on PORT 8080");
})

app.post('/insert/products',function(request,response){
  var key=request.body.category;
  var data=request.body.payload;
  var products=request.body.products;
  console.log("Persisting new products to map for category" + key)
  result[key] = {}
  result[key]['timestamp'] = new Date();
  result[key]['payload'] = data;
  result[key]['products'] = products;
  response.send("OK");
});

app.post('/insert/products/product',function(request,response){
  var command=request.body.command;
  var key=request.body.key;
  console.log("Persisting new products to map for key" + key)
  result['timestamp'] = new Date();
  result['result'] = request.body;
  response.send("OK");
});

function writeCategoryJson(category){
  mkdirp(path, function (err) {
    if (err) return cb(err);
    var fileData = "var data = " + JSON.stringify(result[category]['payload']);
    fs.writeFile(path + category + '.js', fileData,'utf8', function(){
    console.warn("persisting category [" + category + "] to /build directory");
  });
})
};

var async_function = function(val, callback){
    process.nextTick(function(){
        callback(val);
    });
};

app.get('/categories/health',function(request,response){
  var category = request.query.cid;
  var update_date = result[category] ? result[category]['timestamp'] : undefined;
  if (update_date === undefined){
    return response.status(400).send({ message: 'This category doesnt exist!'});
  }
  else if(((new Date) - update_date) > THIRTY_MINUTES){
    return response.status(400).send({ message: 'This category hasnt been updated in last thirty minutes!'});
  }
  async_function(category, writeCategoryJson);
  console.warn("Healthy service");
  response.send("OK");
});

app.get('/categories',function(request,response){
 response.send(result);
});

app.get('/category/:cid',function(request,response){
  var category = req.params.cid;
  response.send(result[category]['payload'])
});

app.get('/category/:cid/products',function(request,response){
  var category = req.params.cid;
  response.send(result[category]['products'])
});


//Express routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/health',function(request,response){
  response.send("OK");
});

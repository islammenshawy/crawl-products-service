var express        =        require("express");
var bodyParser     =        require("body-parser");
var app            =        express();
var result         =       {};
var THIRTY_MINUTES = 30 * 60 * 1000; /* ms */


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));


app.listen(8080,function(){
  console.log("Started on PORT 8080");
})

app.post('/insert/products',function(request,response){
  var key=request.body.category;
  var data=request.body.payload;
  console.log("Persisting new products to map for category" + key)
  result[key] = {}
  result[key]['timestamp'] = new Date();
  result[key]['payload'] = data;
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

app.get('/categories/health',function(request,response){
  var category = request.query.cid;
  var update_date = result[category] ? result[category]['timestamp'] : undefined;
  if (update_date === undefined){
    return response.status(400).send({ message: 'This category doesnt exist!'});
  }
  else if(((new Date) - update_date) > THIRTY_MINUTES){
    return response.status(400).send({ message: 'This category hasnt been updated in last thirty minutes!'});
  }
  response.send("OK");
});

app.get('/products',function(request,response){
 response.send(result);
});

app.get('/',function(request,response){
  response.send("OK");
});

app.get('/health',function(request,response){
  response.send("OK");
});

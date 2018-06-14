var express        =        require("express");
var bodyParser     =        require("body-parser");
var app            =        express();
var result         =       {};

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.listen(3000,function(){
  console.log("Started on PORT 3000");
})

app.post('/test/control',function(request,response){
  var command=request.body.command;
  var key=request.body.key;
  console.log("Persisting new products to map for key" + key)
  result['timestamp'] = new Date();
  result['result'] = request.body;
  response.send("yes");
});

app.get('/products',function(request,response){
  response.send(result);
});
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

MongoClient.connect(url, function(err, db) {

  if (err) throw err;

  console.log("dsa\n\n", db.db())

  var dbo = db.db("mydb2");
  
  dbo.createCollection("customers", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
  
  db.close();
});
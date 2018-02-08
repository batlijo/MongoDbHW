var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = 3000;


var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));


mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoscraper", {
//  useMongoClient: true
});

app.get("/scrape", function(req, res) {

  axios.get("https://www.nytimes.com/").then(function(response) {

    var $ = cheerio.load(response.data);


    $("article h2").each(function(i, element) {

      var result = {};


      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");


      db.Article.create(result)
        .then(function(dbArticle) {

          console.log(dbArticle);
        })
        .catch(function(err) {

          return res.json(err);
        });
    });


    res.send("Scrape Complete");
  });
});


app.get("/articles", function(req, res) {

db.Article.find({})
.then(function(results){
  res.json(results)
})

});


app.get("/articles/:id", function(req, res) {

  db.Article.findOne({_id: req.params.id})
  .populate("note")
  .then(function(results){
    console.log(results)
  })


  });

app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
  .then(function(dbNote){
    console.log(dbNote)
  })

});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

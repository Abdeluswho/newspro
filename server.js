var express = require("express");
var path = require('path');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var hbs = require('express-handlebars');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();
const routes = require("./routes");

app.use(routes);

// Configure middleware
app.set('views', path.join(__dirname, './views'));
app.engine('hbs', hbs({extname: '.hbs', defaultLayout: 'main'}))
app.set('view engine', 'hbs');

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory


// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB

mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, {});

// https://medium.com/

// app.get("/", (req, res) => {
// 	        res.render('index');
// 	    });

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//scraping method
app.get("/scrape", function(req, res){
    console.log("Scraping!");
    var results = [];
    var npr = "https://www.npr.org/sections/national/"
    axios.get(npr).then(function(response) {
        
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);
        // console.log(response.data)
        
        // An empty array to save the data that we'll scrape
        var results = [];

        var parentSelector = "article.item";

        // // Select each element in the HTML body from which you want information.
        // // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // // but be sure to visit the package's npm page to see how it works
        $(parentSelector).each(function(i, element) {

        //     // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
                title: $(element).find("h2.title").text(),
                link: $(element).find("a").attr("href"),    
                blurb: $(element).find("p.teaser").text(),
            })
        });		      
		      	// console.log('success!!!', results)

		      // Create a new Article using the `result` object built from scraping
		    //   db.Headline.create(result)
		    //     .then(function(dbArticle) {
		    //       // View the added result in the console
		    //       console.log(dbArticle);
		    //     })
		    //     .catch(function(err) {
		    //       // If an error occurred, send it to the client
		    //       return res.json(err);
		    //     });		   	 		  
		    res.render('index', {title: 'NPR news scraper!', results});
		    // res.redirect("/");
		 

		    // If we were able to successfully scrape and save an Article, send a message to the client
		    
	  })
});
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

app.post('/save', function(req, res) {
    
    var article={
        headline: req.body.title,
        link : req.body.link,
        body: req.body.blurb
    }
    // Create a new Article using the `article` collected from save button
      db.Headline.create(article)
        .then(function(dbarticle) {
          // View the added result in the console
        //   console.log("You saved it babe!", dbarticle);
          res.redirect("/saved")
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });   
})

app.get('/saved', function(req, res) {
   var results =[];
     
    
    db.Headline.find({}, function(err, article){
        // console.log("db", article)
       
        for (let i = 0; i < article.length; i++) {
            const element = article[i];
            results.push({
                id: element._id,
                title: element.headline,
                link: element.link,
                blurb: element.body
            })
            
        }
        // results = 
            // console.log("/saved", results);
            
            res.render('saved', {title: 'Your npr --saved Articles!', results, message: "DB Articles"});

        })   
})

app.post('/delete/:id', function(req, res) {
    
    var id = req.params.id;
    console.log("ArticleID", id)
    // // Create a new Article using the `article` collected from save button
      db.Headline.findOneAndRemove({"_id": id}, function(err, doc){
            if (err) {
                console.log("DELETE ERR", err)
                
            } else {
                console.log("ELEMENT DELETED", doc);
                res.redirect("/saved")
            }
      })
})

app.get("/articles/:id", function(req, res){
    console.log("/articles", req.params.id);
    var id = req.params.id;

    db.Headline.findOne({"_id": id})
    .populate("note")
    .then(function(doc){
        console.log("article populated BACK :", doc)
        res.json(doc);
    }).catch(function(err){
        res.json(err)
      })
    
})
//*********************************** */
// Route for saving a new Note to the db and associating it with the article
app.post("/articles/:id", function(req, res){
    var articleID = req.params.id
    // res.redirect("/saved")
    
    db.Note.create(req.body)
    .then(function(dbNote) {
        console.log("note saved dbNote ", dbNote)
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Headline.findOneAndUpdate({"_id": articleID }, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function(article) {
      // If the User was updated successfully, send it back to the client
      
      console.log("Note and article success: ", article);
      res.redirect("/articles")
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
    
})

//*****************  
  // Route to see what user looks like WITH populating
  app.get("/articles", function(req, res) {
    // TODO
    // =====
    db.Headline.find({})
  
    .populate("note")
    .then(function(db){
        console.log(db);
      res.json(db);
    })
    .catch(function(err){
      res.json(err)
    })
    
  });
  

//***************Saving to DB snippet************************

// app.get("/test", function(req, res) {
//   // TODO: Finish the route so it grabs all of the articles
//   db.Headline.create({'headline': 'test', }, function(err, articles){
//     if (err) {
//       res.json(err)
//     }else{
//       res.json(articles);
//     }
    

//   })
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

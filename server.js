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
                link: $(element).find("a").attr("href"),
                title: $(element).find("h2.title").text(),
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

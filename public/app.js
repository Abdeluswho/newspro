$(document).ready(() => {

$("#cloud").on("click", function(e) {
	e.preventDefault();
	
	$.ajax({
    method: "GET",
    url: "/scrape",
    success: function(news){
    	console.log("got data", news);
	}
  })
	
});

$("#savebtn").on("submit", function(e){
	e.preventDefault();

	console.log("clicked")

	this.value()= 'saved';
	// e.this.attr(href="/save", method="POST");	

		// $.ajax({
		// 	method: "POST",
		// 	url: "/save",
		// 	success: function(err){
		// 		if(err){
		// 			console.log("POST ERROR", err);
		// 		}else {
		// 			console.log("check the DB");
		// 		}

		// 	}
		//   })

})
















})//DOM
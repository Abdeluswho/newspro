$(document).ready(() => {

$("#cloud").on("click", function(e) {
	e.preventDefault();
	
	$.ajax({
    method: "GET",
    url: "/scrape",
    success: function(news){
    	console.log("got data", news);

    	for (var i = 0; i < news.length; i++) {
    			$("#result").append('<div class="panel panel-default">' +
		  								'<div class="panel-heading">' +
		   						 			'<h3 class="panel-title" href="'+ news[i].link +'">'+news[i].title+'</h3>'+
		 								'</div>'+
		 								'<div class="panel-body">' + news[i].blurb +'</div>'+

		 							'</div>')
    	}

    	

	

		

	}
  })
	
});
















})//DOM
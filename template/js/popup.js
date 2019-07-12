function popupOpenClose(popup) {
	
	/* Add div inside popup for layout if one doesn't exist */
	if ($(".wrapper").length == 0){
		$(popup).wrapInner("<div class='wrapper'></div>");
	}
	
	/* Open popup */
	$(popup).show();

	/* Close popup if user clicks on background */
	$(popup).click(function(e) {
		if ( e.target == this ) {
			if ($(popup).is(':visible')) {
				$(popup).hide();
			}
		}
	});

	/* Close popup and remove errors if user clicks on cancel or close buttons */
	$(popup).find("button[name=close]").on("click", function() {
		if ($(".formElementError").is(':visible')) {
			$(".formElementError").remove();
		}
		$(popup).hide();
	});
}

function popupOpenCloseApp(id, status, date, customer, subject, attachments, employees, comments) {
	
	$("#popups")
	.append(
		$("<div>").attr("class","popup1 popup popupApp")
		.append(
				$("<div>").attr("class","container")
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-11")
								.append(
										$("<center>")
										.append(
												$("<h2>").attr("style","color: black")
												.append(
														$("<b>").text("Application ID : "+ id)
													)
											)
									)
							)
						.append(
								$("<div>").attr("class","col-1")
								.append(
										$("<a>").attr("href",attachments)
										.append(
												$("<i>").attr("class","fa fa-paperclip fa-3x").attr("style","color: rgb(88, 92, 88)").attr("aria-hidden","true")
											)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Customer : " + customer)
									)
							)
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Status : " + status)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Date : " + date)
									)
							)
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Subject : " + subject)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<br>")
					)
				.append(
					$("<div>").attr("class"," scroll_text").attr("id","app1")
				)
			)
	)
	employees = employees.split(',')
	comments = comments.split(',')

	iter = -1
	
	if(comments[0] != "")
		iter = comments.length-1;

	console.log(iter)

	for(var i=0; i<employees.length;i++){
		if((typeof comments[i] === "undefined" || comments[i] == "" && i>iter)|| iter==-1){
			$("#app1").append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-3")
								.append(
										$("<h4>").text("Added By : " + employees[i])
									)
							)
						.append(
								$("<div>").attr("class","col-8")
								.append(
										$("<textarea>").attr("readonly","readonly").text(comments[i])
									)
							)

					)
					.append($("<br>"))
		}
		else if(status == "Error" && i == iter){
			$("#app1").append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-3")
								.append(
										$("<h4>").text("Added By : " + employees[i])
									)
							)
						.append(
								$("<div>").attr("class","col-8")
								.append(
										$("<textarea>").attr("readonly","readonly").text(comments[i])
									)
							)
						.append(
								$("<div>").attr("class","col-1")
								.append(
										$("<i>").attr("class","fa fa-exclamation-circle fa-3x").attr("aria-hidden","hidden").attr("style","color: red")
									)
							)

					)
					.append($("<br>"))	
		}
		else{
			$("#app1").append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-3")
								.append(
										$("<h4>").text("Added By : " + employees[i])
									)
							)
						.append(
								$("<div>").attr("class","col-8")
								.append(
										$("<textarea>").attr("readonly","readonly").text(comments[i])
									)
							)
						.append(
								$("<div>").attr("class","col-1")
								.append(
										$("<i>").attr("class","fa fa-check-circle fa-3x").attr("aria-hidden","hidden").attr("style","color: rgb(15,168,23)")
									)
							)

					)
					.append($("<br>"))
		}
	}

	/* Add div inside popup for layout if one doesn't exist */
	if ($(".wrapper").length == 0){
		$(".popupApp").wrapInner("<div class='wrapper'></div>");
	}
	
	/* Open popup */
	$(".popupApp").show();

	/* Close popup if user clicks on background */
	$(".popupApp").click(function(e) {
		if ( e.target == this ) {
			if ($(".popupApp").is(':visible')) {
				$(".popupApp").hide();
				$(".popupApp").remove();
			}
		}
	});
}

function popupOpenCloseEmployee(id, status, date, customer, subject, attachments, employees, comments) {
	
	$("#popups")
	.append(
		$("<div>").attr("class","popup1 popup popupEmployee")
		.append(
				$("<div>").attr("class","container")
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-11")
								.append(
										$("<center>")
										.append(
												$("<h2>").attr("style","color: black")
												.append(
														$("<b>").text("Application ID : "+ id)
													)
											)
									)
							)
						.append(
								$("<div>").attr("class","col-1")
								.append(
										$("<a>").attr("href",attachments)
										.append(
												$("<i>").attr("class","fa fa-paperclip fa-3x").attr("style","color: rgb(88, 92, 88)").attr("aria-hidden","true")
											)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Customer : " + customer)
									)
							)
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Status : " + status)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Date : " + date)
									)
							)
						.append(
								$("<div>").attr("class","col-6")
								.append(
										$("<h4>").text("Subject : " + subject)
									)
							)
					)
				.append(
						$("<br>")
					)
				.append(
						$("<br>")
					)
				.append(
					$("<div>").attr("class"," scroll_text").attr("id","app1")
				)
			)
	)
	employees = employees.split(',')
	comments = comments.split(',')
	iter = 0

	if(comments[0] != "")
		iter = comments.length;
	console.log(iter)

	for(var i=0; i<iter;i++){
			$("#app1").append(
						$("<div>").attr("class","row")
						.append(
								$("<div>").attr("class","col-3")
								.append(
										$("<h4>").text("Added By : " + employees[i])
									)
							)
						.append(
								$("<div>").attr("class","col-8")
								.append(
										$("<textarea>").attr("readonly","readonly").text(comments[i])
									)
							)
						.append(
								$("<div>").attr("class","col-1")
								.append(
										$("<i>").attr("class","fa fa-check-circle fa-3x").attr("aria-hidden","hidden").attr("style","color: rgb(15,168,23)")
									)
							)

					)
					.append($("<br>"))
	}
					$("#app1").append(
						$("<form>").attr("method", "POST")
						.append(
							$("<div>").attr("class","row")
							.append(
									$("<div>").attr("class","col-3")
									.append(
											$("<h4>").text("Please add your comment or report error if any")
										)
								)
							.append(
									$("<div>").attr("class","col-8")
									.append(
											$("<textarea>").attr("name", "comment").prop("required", true)
										)
									.append(
											$("<input>").attr("type", "hidden").attr("name", "employee").attr("value", employees[iter])
										)
									.append(
											$("<input>").attr("type", "hidden").attr("name", "id").attr("value", id)
										)
								)

						)
						.append($("<br>"))
						.append($("<br>"))
						.append(
							$("<center>")
							.append(
								$("<button>").attr("class", "uza-btn btn-2").attr("type", "submit").attr("formaction", "/submitComment").text("Submit")
							)
							.append(
								$("<button>").attr("class", "uza-btn btn-2").attr("type", "submit").attr("formaction", "/reportError").text("Report Error")
							)
						)
					)

	/* Add div inside popup for layout if one doesn't exist */
	if ($(".wrapper").length == 0){
		$(".popupEmployee").wrapInner("<div class='wrapper'></div>");
	}
	
	/* Open popup */
	$(".popupEmployee").show();

	/* Close popup if user clicks on background */
	$(".popupEmployee").click(function(e) {
		if ( e.target == this ) {
			if ($(".popupEmployee").is(':visible')) {
				$(".popupEmployee").hide();
				$(".popupEmployee").remove();
			}
		}
	});
}

function popupOpenCloseNew(id, status, date, customer, subject, attachments) {
    $("#popups")
    .append(
    	$("<div>").attr("class", "popup1 popup popupNew")
    	.append(
    		$("<div>").attr("class", "container")
    		.append(
    			$("<div>").attr("class", "col-12")
    			.append(
					$("<center>")
					.append(
						$("<h2>").attr("style", "color:black")
						.append(
							$("<b>").text("Application ID: " + id)
						)
					)
    			)
    		)
    		.append(
				$("<p>").attr("align", "left").text("Customer: " + customer + "Date: " + date)
					
    		)
    		.append(
    			$("<div>").attr("align", "right")
    			.append(
    				$("<div>").attr("class","col-12")
    				.append(
    					$("<button>").attr("class","addit").attr("onclick","Addappli()").text("Add Employee").attr("style","font-size:16px")
					)
    				.append(
    					$("<button>").attr("class","addit").append($("<a>").attr("href", attachments).text("Attachments").attr("style","color:white"))
    				)
    			)
    		)
    		.append(
    			$("<hr/>")
    		)
    		.append(
    			$("<br/>")
    		)
    		.append(
    			$("<div>").attr("class","container scroll_text1")
    			.append(
    				$("<form>").attr("id","app1").attr("method", "POST").attr("action", "/employeesPost")
    				.append(
    					$("<input>").attr("type", "hidden").attr("name", "id").attr("value", id)
    				)
				)
				
			)
			.append(
				$("<button>").attr("class","addit").text("Submit").attr("form","app1")
			)
    		.append(
    			$("<br/>")
    		)
    	)
    )
	/* Add div inside popup for layout if one doesn't exist */
	if ($(".wrapper").length == 0){
		$(".popupNew").wrapInner("<div class='wrapper'></div>");
	}
	
	/* Open popup */
	$(".popupNew").show();

	/* Close popup if user clicks on background */
	$(".popupNew").click(function(e) {
		if ( e.target == this ) {
			if ($(".popupNew").is(':visible')) {
				$(".popupNew").hide();
				$(".popupNew").remove();
			}
		}
	});
}


function popupClose(popup){
		if ($(".formElementError").is(':visible')) {
			$(".formElementError").remove();
		}
		$(popup).hide();
}

$(document).ready(function () {
	$("[data-js=openAnn]").on("click", function() {
		popupOpenClose($(".popupAnn"));
	});
});

function popupApp(id){
	var status = document.getElementById(id + "status").innerHTML
	var date = document.getElementById(id + "date").innerHTML
	var customer = document.getElementById(id + "customer").innerHTML
	var subject = document.getElementById(id + "subject").innerHTML
	var attachments = document.getElementById(id + "attachments").value
	var employees = document.getElementById(id + "employees").value
	var comments = document.getElementById(id + "comments").value
	popupOpenCloseApp(id, status, date, customer, subject, attachments, employees, comments);
}

function popupNew(id){
	var status = document.getElementById(id + "status").innerHTML
	var date = document.getElementById(id + "date").innerHTML
	var customer = document.getElementById(id + "customer").innerHTML
	var subject = document.getElementById(id + "subject").innerHTML
	var attachments = document.getElementById(id + "attachments").value
	popupOpenCloseNew(id, status, date, customer, subject, attachments);
}
function popupEmployee(id){
	var status = document.getElementById(id + "status").innerHTML
	var date = document.getElementById(id + "date").innerHTML
	var customer = document.getElementById(id + "customer").innerHTML
	var subject = document.getElementById(id + "subject").innerHTML
	var attachments = document.getElementById(id + "attachments").value
	var employees = document.getElementById(id + "employees").value
	var comments = document.getElementById(id + "comments").value
	popupOpenCloseEmployee(id, status, date, customer, subject, attachments, employees, comments);	
}
function Addappli(){
                   $("#app1")
                    
                    .append(
                        $("<div>").attr('class', 'row')
                            .append(
                                $("<div>").attr('class', 'col-10')
                                    .append(
                                        $("<input>").attr('type', "text").attr('placeholder','Enter employee name').attr('class', 'ipp2').attr("name", "employees")
                                    )
                            )
                            .append(
                                $("<div>").attr('class', 'col-1')
                                    .append(
                                        $("<button>").attr("onclick","this.parentNode.parentNode.remove()").attr('class', 'cross')
                                            .append(
                                                $("<i>").attr('class', 'fa fa-times-circle fa-2x').attr('aria-hidden', 'true')
                                            )
                                    )
                            )
                    )
                    
            }

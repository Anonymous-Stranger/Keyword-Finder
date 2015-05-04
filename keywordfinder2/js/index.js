
var tutSlide = 0;

const tutSlides = [
	
	SVGTutSlide("", "/img/tutorial/0_explanation/0.svg", "/img/tutorial/0_explanation/0.png"),
	SVGTutSlide("How Keywords Can Find Quotes", "/img/tutorial/0_explanation/1.svg", "/img/tutorial/0_explanation/1.png"),
	
	SVGTutSlide("", "/img/tutorial/1_basicusage/0.svg", "/img/tutorial/1_basicusage/0.png"),
	ImgTutSlide("Basic Usage", "/img/tutorial/1_basicusage/1.png"),
	ImgTutSlide("Basic Usage", "/img/tutorial/1_basicusage/2.png"),
	ImgTutSlide("Basic Usage", "/img/tutorial/1_basicusage/3.png"),
	ImgTutSlide("Basic Usage", "/img/tutorial/1_basicusage/4.png"),
	SVGTutSlide("Basic Usage", "/img/tutorial/1_basicusage/5.svg", "/img/tutorial/1_basicusage/5.png"),

	SVGTutSlide("", "/img/tutorial/2_examples/0.svg", "/img/tutorial/2_examples/0.png"),
	SVGTutSlide("Keyword Ideas / Examples", "/img/tutorial/2_examples/1.svg", "/img/tutorial/2_examples/1.png"),
	SVGTutSlide("Keyword Ideas / Examples", "/img/tutorial/2_examples/2.svg", "/img/tutorial/2_examples/2.png"),
	SVGTutSlide("Keyword Ideas / Examples", "/img/tutorial/2_examples/3.svg", "/img/tutorial/2_examples/3.png"),

	HTMLTutSlide("Ready to go?", "<label id='tutorialFinished' for='showIntro'> Close Tutorial </label>")

];

$(function(){
	
	loadWebview();
	updateTutSlide();

	$("#prevSlide").click(prevSlide);
	$("#nextSlide").click(nextSlide);

	$(document).keydown(function(evt){
		
		if (!($("#showIntro").prop("checked") && $("#showTutorial").prop("checked"))) return;

		switch (evt.keyCode) {
			case 37: //left arrow
				$("#prevSlide").click();
				break;
			case 39: //right arrow
				$("#nextSlide").click();
				break;
			default: ;
		}
	});

});


function nextSlide(){
	tutSlide++;
	updateTutSlide();
}

function prevSlide(){
	tutSlide--;
	updateTutSlide();
}

function updateTutSlide() {
	updateSlideContent();
	$("#prevSlide")
		.css("opacity", (tutSlide == 0) ? 0 : 1)
		.css("pointer-events", (tutSlide == 0) ? "none" : "auto")
	;
	$("#nextSlide")
		.css("opacity", (tutSlide == tutSlides.length - 1) ? 0 : 1)
		.css("pointer-events", (tutSlide == tutSlides.length - 1) ? "none" : "auto")
	;
}

function updateSlideContent(onFinished){
	if (tutSlide < 0 || tutSlide >= tutSlides.length) {
		tutSlide = Math.min(tutSlides.length - 1, Math.max(0, tutSlide));
		if (onFinished) onFinished();
		return;
	}

	var slide = tutSlides[tutSlide];

	var title = "TUTORIAL" + (slide["title"] != "" ? " - " : "") + slide["title"];

	$("#tutorial #slideTitle").text(title);

	switch (slide["type"]) {
		case "text":
			$("#tutorialSlide").text(slide["text"]);
			break;
		case "html":
			$("#tutorialSlide").html(slide["html"]);
			break;
		case "img":
			$("#tutorialSlide").html("<img src='"+slide["url"]+"'/>");
			break;
		default: throw new Exception("Error: Slide type not recognized - "+slide);
	}

	if (onFinished) onFinished();
}

function SVGTutSlide(title, svgImg, altImg) {
	return HTMLTutSlide(title, 
			'<object type="image/svg+xml" data="'+svgImg+'">'
      	+		'<img src="'+altImg+'"/>'
    	+	'</object>');
}

function TextTutSlide(title, text) {
	var slide = new TutSlide("text", title);
	slide["text"] = text;
	return slide;
}

function ImgTutSlide(title, url){
	return HTMLTutSlide(title, "<img src='"+url+"'/>");
}

function HTMLTutSlide(title, html) {
	var slide = new TutSlide("html", title);
	slide["html"] = html;
	return slide;
}

function TutSlide(type, title){
	return {"type": type, "title": title};
}

function loadWebview() {
	var webview = document.getElementById("content");
	
	webview.addEventListener("loadstart", showLoading);

	webview.addEventListener("loadstop", function(){
		stopLoading();
		injectCSS(webview, "css/injection.css");
		injectJS(webview, "external/jquery-2.1.3.min.js");
		injectJS(webview, "js/injection.js");
	});
}

function showLoading() {
	$("#loadingContainer").css("opacity", 1);
}

function stopLoading() {
	$("#loadingContainer").css("opacity", 0);	
}

function injectCSS(webview, filename) {
	webview.insertCSS(createInjection(filename));
}

function injectJS(webview, filename) {
	webview.executeScript(createInjection(filename));
}

function createInjection(filename) {
	return {"file": filename};
}
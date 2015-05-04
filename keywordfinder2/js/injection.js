
// SCSS constants ported over for javascript.
const KW_CSS_SETTINGS = {
	"color0"		: 	"#222"		,
	"color1"		: 	"white"		,
	"color2"		: 	"#EE7"		, 
	"color0-v2"		: 	"#333"		,
	"color2-v2"		: 	"#EEC522"	,
	"header-height"	: 	"4rem"		
}

var kwUpdatingChapter = false;
var kwCurrentResult = -1;

$(function(){

	loadFont();

	anchorOverride();

	createKWFinder();

	overrideCSS();

	disableSanityCheck();

	$("#kwSelectBook").click(selectBook);

	$("#scStop").click(disableSanityCheck);

	$("#scContinue").click(beginKeywordFinding);

	$("#kwChapters").change(gotoSelectedChapter);

	$(window).scroll(updateOnScroll);

	$("#kwAddKeyword").change(newKeyword);

	$("#kwAddKeywordButton").click(newKeyword);

	$("#kwPrevResult").click(prevResult);

	$("#kwNextResult").click(nextResult);

	$(document).keydown(function(evt){
		switch (evt.keyCode) {
			case 37: //left arrow
				$("#kwPrevResult").click();
				break;
			case 39: //right arrow
				$("#kwNextResult").click();
				break;
			default: ;
		}
	});

	updatePagesOnScroll();

	if (getCookie("shouldBegin")) beginKeywordFinding();

});

function loadFont(){
/* Load FontAwesome fonts (for icons). */
	$("head").append("<link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'/>");
}

function anchorOverride(){
/* Override existing scroll to anchor code, which results in this file being reinjected. */
	
	var links = document.links;
	
	if (!links) return;
	
	for (var i = 0; i < links.length; i++) {
		
		if (links[i].href.indexOf("#") >= 0) links[i].onclick = function(){
			scrollToElement("#"+this.href.split("#")[1]);
			return false;
		}

	}
}

function scrollToElement(cssSelector) {
/* Scroll to a given element. */
	$('html, body')
		.stop()
		.animate({
			scrollTop: ( $(cssSelector).offset().top - 100 )
		}, 1000)
	;
}

function createKWFinder(){
/* Add header bar and related elements. */

	$("body").prepend(
			"<input type='checkbox' id='kwFinderOn' class='kwInvisible'/>"
		+	"<input type='checkbox' id='kwFinderMenuOn' class='kwInvisible'/>"
		+	"<header id='kwHeader' class='kwRoot'>"
		+   	"<div id='kwNav'>"
		+			"<a id='kwPrevPage' href='javascript: history.back(); location.reload();'><i class='fa fa-arrow-left'></i></a>"
		+			"<a id='kwRefresh' href='javascript:location.reload();'><i class='fa fa-refresh'></i></a>"
		+			"<a id='kwNextPage' href='javascript:history.forward();'><i class='fa fa-arrow-right'></i></a>"
		+		"</div>"
		+		"<span id='kwTitle'>Keyword Finder</span>"
		+		"<select id='kwChapters'></select>"
		+		"<div id='kwResults'>"
		+			"<a id='kwPrevResult'><i class='fa fa-chevron-circle-left'></i></a> "
		+			"<span id='resultCount'></span> "
		+			"<a id='kwNextResult'><i class='fa fa-chevron-circle-right'></i></a>"
		+		"</div>"
		+		"<div id='kwActionButtons'>"
		+			"<button id='kwSelectBook'>Select This Book</button>"
		+			"<label id='kwFinderMenuButton' for='kwFinderMenuOn'><i class='fa fa-chevron-down'></i></label>"
		+		"</div>"
		+	"</header>"
		+	"<header id='kwFinderMenu' class='kwRoot'>"
		+		"<div id='kwKeywordsActions'>"
		+			"<span id='kwKeywordsTitle'> Keywords: </span>"
		+			"<input type='text' id='kwAddKeyword' placeholder='New Keyword'/>"
		+			"<button id='kwAddKeywordButton'>Add Keyword</button>"
		+		"</div>"
		+		"<div id='kwKeywords'></div>"
		+	"</header>"
		+	"<label id='kwFinderMenuShadow' for='kwFinderMenuOn'></label>"
		+	"<div id='kwMinPage' class='kwRoot'></div>"
		+	"<div id='kwMaxPage' class='kwRoot'></div>"
		+	"<h3 class='kwInvisible'>Top of Page</h3>"
	);

	$("body").append(
		  "<div id='kwSanityCheckContainer' class='kwRoot'><div id='sanityCheck'>"
		+	"<div id='scHeader'> We're sorry. </div>"
		+	"<div id='scDesc'> We're not sure that this page is a book. Then again, we're just a program. </div>"
		+	"<button id='scContinue' class='scButton'> It's a book. Continue. </button>"
		+	"<button id='scStop' class='scButton'> Nevermind. I was just testing you. </button>"
		+ "</div></div>"
	);

	updateResultCount();

}

function overrideCSS() {
/* Override existing css. */

	$("#kwHeader a, #kwHeader label").css("background-color", "inherit");

	$("*").css("transition", "all 400ms");

	$("#kwHeader").css("height", KW_CSS_SETTINGS["header-height"]);

	$("body > *").not("#kwHeader, p").each(function(){
		var margin = $(this).css("margin-top");
		$(this)
			.css("margin-top", KW_CSS_SETTINGS["header-height"])
			.css("margin-top", "-webkit-calc("+margin+" + "+KW_CSS_SETTINGS["header-height"]+")")
		;
	});

	$("#kwMinPage, #kwMaxPage")
		.css("opacity", 0)
		.css("transition", "opacity 400ms")
	;

}

function selectBook() {
/* Begin Keyword Finding for a given book. */
	
	if (isHTMLBook()) {
		beginKeywordFinding();
		return;
	}
	
	var id = getBookID();

	if (id) gotoHTMLBook(id);

	else checkUserSanity();

}

function isHTMLBook() {
/* Check if current url is a book's html file. */
	return urlMatch(/www.gutenberg.org\/files\/[0-9]+\/[0-9]+\-h\/[0-9]+\-h.htm/);
}

function isBookPage() {
/* Check if current url is a book's main page. */
	return urlMatch(/www.gutenberg.org\/ebooks\/[0-9]+/);
}

function urlMatch(regex) {
/* Check if the current url matches a given regex. */
	return document.URL.match(regex) ? true : false;
}

function getBookID() {
/* Gets the id of a book, assuming currently on the book's main page. */
	if (!isBookPage()) return null;
	var parts = document.URL.split("/");
	return parts[parts.length - 1];
}

function gotoHTMLBook(id) {
/* Redirects to the html file of a book, given its id. */
	if (!id) return;
	setCookie("shouldBegin", true, 60);
	// window.location.href = "http://www.gutenberg.org/files/"+id+"/"+id+"-h/"+id+"-h.htm";
	$("#download .files a[title='Download']").first()[0].click();
}

function checkUserSanity() {
/* Asks user if current url is really a book page. */
	enableSanityCheck();
}

function enableSanityCheck() {
/* Displays the sanity check. */
	fadeIn("#kwSanityCheckContainer");
}

function disableSanityCheck() {
/* Stops displaying the sanity check. */
	fadeOut("#kwSanityCheckContainer");
}

function fadeIn(cssSelector) {
/* Fades in a given element. */
	$(cssSelector)
		.show()
		.css("pointer-events", "auto")
		.animate({opacity: 1}, 200)
	;
}

function fadeOut(cssSelector) {
/* Fades out a given element. */
	$(cssSelector)
		.css("pointer-events", "none")
		.animate({opacity: 0}, 200, function(){
			setTimeout("$('"+cssSelector+"').hide()", 400);
		})
	;
}

/*----- variants of cookie code on W3Schools. -----*/
function setCookie(cname, cvalue, secs) {
/* Creates a cookie with the given name and value, set to expire in the given time limit. */
    var d = new Date();
    d.setTime(d.getTime() + (secs*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";domain=;path=/";
}

function getCookie(cname) {
/* Gets the value of a cookie with a given name. */
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

/* ---------------------- Keyword Finding Functions --------------------------- */

function beginKeywordFinding(){
/* Sets page up for finding keywords. */
	setCookie("shouldBegin", false, -1);
	disableSanityCheck();
	setTimeout('$("#kwFinderOn").prop("checked", true)', 700);
	setTimeout('$("#kwFinderMenuOn").prop("checked", true)', 1400);
	setTimeout(function(){
		formatForKeywords();
		loadChapterSelector();
		$("#kwAddKeyword").focus();
	}, 2000);
}

function formatForKeywords() {
/* Formats the page for finding keywords. */
	$("body").css({
		"background-color": KW_CSS_SETTINGS["color0"],
		"color": KW_CSS_SETTINGS["color1"],
		"padding": "3rem"
	});
	$("p").css("margin-left", "1.2rem");
	$("h1, h2, h3").css("color", KW_CSS_SETTINGS["color2"]);
	$("h1, h2, h3").addClass("kwChapter");
	$("#kwMinPage, #kwMaxPage").css("opacity", 1);
}

function createChapterIdentifier(index) {
/* Creates a class capable of identifying a chapter. */
	return "kwChapter-"+index;
}

function loadChapterSelector(){
/* Fills the #kwChapters with options for each chapter. */
	$(".kwChapter").each(function(index){
		var identifier = createChapterIdentifier(index);
		$(this).addClass(identifier);
		$("#kwChapters").append("<option value='"+identifier+"'>"+$(this).text()+"</option>");
	});
}

function gotoSelectedChapter(){
/* Goes to the selected chapter. */
	if (kwUpdatingChapter) return;
	var identifier = $("#kwChapters").val();
	scrollToElement("."+identifier);
}

function updateOnScroll() {
	updateChapterOnScroll();
	updatePagesOnScroll();
}

function updateChapterOnScroll(){
/* Updates current chapter based on scroll position. */
	var scrollPos = $(window).scrollTop();
	$(".kwChapter").each(function(index){
		var loc = $(this).offset().top;
		if (scrollPos > loc - 150) {
			kwUpdatingChapter = true;
			$("#kwChapters option[value='"+createChapterIdentifier(index)+"']").prop("selected", true);
			kwUpdatingChapter = false;
		}
	});
}

function updatePagesOnScroll() {
	var scrollPos = $(window).scrollTop();
	var windowHeight = window.innerHeight;

	var minPageNum = Math.floor(scrollPos / windowHeight);
	var minPagePos = minPageNum * windowHeight - scrollPos;

	updatePage("#kwMinPage", minPageNum, minPagePos);
	updatePage("#kwMaxPage", minPageNum + 1, minPagePos + windowHeight);
}

function updatePage(cssSelector, pageNum, pagePos) {
	$(cssSelector)
		.text(pageNum)
		.css("top", pagePos+"px")
	;
}

function newKeyword() {
/* Adds a new keyword to be found. */	

	var newKey = $("#kwAddKeyword").val();
	if (newKey == "") return;

	$("#kwKeywords").append("<span class='kwKeyword'>"+newKey+"<i class='fa fa-remove'></i></span>");
	$(".kwKeyword").click(function(){
		$(this).remove();
		refreshSearch();
	});
	$("#kwAddKeyword").val("");
	refreshSearch();
}

function findKeywordsInHTML() {
/* Finds keywords in the body. */

	var gibberish = "!(#*!^&@!(#&%!($!(";

	var keywords = getKeywords();

	if (keywords.length == 0) return;

	var regex = createRegex(keywords);

	$("body > *").each(function(){

		if ($(this).is(".kwRoot")) return;

		var text = $(this).html();

		text = text.replace(/<(("[^"]*")|('[^']')|[^<>])*>/g, gibberish+"$&"+gibberish); // Identify tags.
		text = text.split(gibberish); //Split text to separate tags from content.

		for (var i = 0; i < text.length; i++) {
			
			if (text[i].indexOf("<") === 0) continue; //If tag, ignore

			text[i] = text[i].replace(regex, "<span class='kwHighlight'>$&</span>");

		}

		$(this).html(text.join(""));

	});

}

function getKeywords() {
/* Fetches the keywords in an array. */
	var keywords = [];
	$(".kwKeyword").each(function(){
		keywords.push($(this).text());
	});
	return keywords.sort(function(a, b) {
		return b.length - a.length;
	});
}

function createRegex(keywords) {
/* Creates a regex based on the keywords. */
	var mask = "";
	for (var i = 0; i < keywords.length; i++) {
		mask += (i == 0 ? "" : "|") + "("+sanitizeMask(keywords[i])+")";
	}
	return new RegExp(mask, "ig");
}

function sanitizeMask(key) {
/* Sanitizes a given key to be used as part of a regex. */
	return key.replace(/[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#\:\!\=\|]/ig, "\\$&");
}

function refreshSearch() {
/* Refreshes the keyword search results. */
	$(".kwHighlight").each(function(){
		$(this).replaceWith($(this).text());
	});
	
	findKeywordsInHTML();

	$(".kwHighlight").each(function(index){
		$(this)
			.addClass( createResultIdentifier(index) )
			.attr("resultNum", index)
			.click(selectThisResult)
		;
	});

	kwCurrentResult = -1;
	
	updateResultCount();
}

function createResultIdentifier(index){
/* Creates a css class to identify a result. */
	return "kwHighlight-"+index;
}

function updateResultCount(){
/* Updates the result count to reflect the current result and total number of results. */
	var numResults = $(".kwHighlight").length;
	$("#resultCount").text((numResults == 0)  ? "No Results" : ("Result " + Math.max(1, kwCurrentResult + 1) + " of "+numResults));

}

function nextResult() {
/* Goes to the next result. */
	kwCurrentResult = (kwCurrentResult + 1) % $(".kwHighlight").length;
	gotoCurrentResult();
}

function prevResult() {
/* Goes to the previous result. */
	kwCurrentResult = ((kwCurrentResult <= 0) ? $(".kwHighlight").length : kwCurrentResult) - 1;
	gotoCurrentResult();
}

function selectThisResult() {
	kwCurrentResult = parseInt($(this).attr("resultNum"));
	gotoCurrentResult();
}

function gotoCurrentResult() {
/* Scrolls or shifts to the current result. */
	updateResultCount();

	$(".kwHighlight[selected]").removeAttr('selected');
	var selector = "."+createResultIdentifier(kwCurrentResult);
	
	$(selector).attr("selected", "selected");
	if (!elementInView(selector)) scrollToElement(selector);
}

function elementInView(cssSelector) {
/* Checks if the given element is in view. */

	var scrollPos = $(window).scrollTop();
	var windowHeight = window.innerHeight;

	var loc = $(cssSelector).offset().top;

	if (loc < scrollPos + 150) return false;

	if (loc > scrollPos + windowHeight - 150) return false;

	return true;

}


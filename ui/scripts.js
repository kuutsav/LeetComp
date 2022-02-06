// Constants
var pageSize = 25;
var nPages = Math.ceil(data.length / pageSize);

console.log(pageSize);
console.log(nPages);

// Reference to the table with posts info
var tableTbodyRef = document.getElementById("postInfo").getElementsByTagName('tbody')[0];

// Add rows to the postInfo table
function updatePostsTableContent(startIndex, endIndex) {
    var myHtmlContent = "";
    for (var i = startIndex; i < endIndex; i++) {
        myHtmlContent += "<tr><td>" + data[i]["company"] + "</td>";
        myHtmlContent += "<td>" + data[i]["role"] + "</td>";
        myHtmlContent += "<td>" + data[i]["yoe"] + "</td>";
        myHtmlContent += "<td>" + data[i]["salary"] + "</td>";
        myHtmlContent += "<td>" + data[i]["date"] + "</td>";
        myHtmlContent += "<td>" + data[i]["viewCount"] + "</td>";
        myHtmlContent += "<td>" + data[i]["voteCount"] + "</td>";
        myHtmlContent += "<td>" + data[i]["id"] + "</td></tr>";
    }
    tableTbodyRef.innerHTML = myHtmlContent;
};
updatePostsTableContent(0, pageSize)

// Nav pagniation filter
function filterNavData(e) {
    pageNo = parseInt(e.text)
    startIndex = (pageNo - 1) * pageSize
    endIndex = startIndex + pageSize
    console.log(startIndex)
    console.log(endIndex)
    updatePostsTableContent(startIndex, endIndex)
};

// Increment Nav page numbers
function IncrementNavPageNo() {
    document.getElementById("navPageNo1").text = parseInt(document.getElementById("navPageNo1").text) + 1
    document.getElementById("navPageNo2").text = parseInt(document.getElementById("navPageNo2").text) + 1
    document.getElementById("navPageNo3").text = parseInt(document.getElementById("navPageNo3").text) + 1
}


// Decrement Nav page numbers
function DecrementNavPageNo() {
    document.getElementById("navPageNo1").text = parseInt(document.getElementById("navPageNo1").text) - 1
    document.getElementById("navPageNo2").text = parseInt(document.getElementById("navPageNo2").text) - 1
    document.getElementById("navPageNo3").text = parseInt(document.getElementById("navPageNo3").text) - 1
}

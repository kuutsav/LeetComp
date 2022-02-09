// Data
var data = [];

// Constants
var pageSize = 25;
var nPages = Math.ceil(data.length / pageSize);

function setFullTimeOrInternship(yrOrPm) {
    window.data = [];
    for (i = 0; i < allData.length; i++) {
        if (allData[i]["yrOrPm"] == yrOrPm) {
            window.data.push(allData[i]);
        }
    }
}
setFullTimeOrInternship("yearly");

function updatePageCount() {
    window.nPages = Math.ceil(data.length / pageSize);
}

// Reference to the table with posts info
var tableTbodyRef = document.getElementById("postInfo").getElementsByTagName('tbody')[0];

function getAllBaseSalaries() {
    var salaries = [];
    for (i = 0; i < data.length; i++) {
        salaries.push(data[i]["cleanSalary"] / 100000)
    }
    return salaries;
}

function plotSalaryBarChartData() {
    salaries = getAllBaseSalaries();
    var trace = {
        x: salaries,
        type: "histogram",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var layout = {
        title: { text: '# salaries #', font: { size: 12 }},
        height: 400,
        margin: { t: 80, l: 0, r: 0 },
        yaxis: { automargin: true },
        xaxis: { tickprefix: "₹ ", ticksuffix: " lpa" }
    };
    var salaryBarChart = [trace];
    Plotly.newPlot('salaryBarChart', salaryBarChart, layout);
}
plotSalaryBarChartData();

function plotTopCompaniesChartData() {
    var companies = [];
    var counts = [];
    for (i = 0; i < metaInfo["top20Companies"].length; i++){
        companies.push(metaInfo["top20Companies"][i][0])
        counts.push(metaInfo["top20Companies"][i][1])
    }
    var data = [{
        type: 'bar',
        x: companies,
        y: counts,
        orientation: 'v',
        opacity: 0.5,
        marker: { color: "green" }
      }];
    var layout = {
        title: { text: '# top companies (static list) #', font: { size: 12 }},
        margin: { t: 80 },
        xaxis: { tickfont: {size: 8} },
    }
    Plotly.newPlot('topCompaniesBarChart', data, layout);
}
plotTopCompaniesChartData();

function getFormattedYoe(yoe) {
    if (yoe == -1) {
        return "<button class='btn-danger'>n/a</button>";
    }
    else {
        return yoe;
    }
}

// Add rows to the postInfo table
function updatePostsTableContent(startIndex, endIndex) {
    var myHtmlContent = "";
    endIndex = Math.min(data.length, endIndex)
    for (var i = startIndex; i < endIndex; i++) {
        myHtmlContent += "<tr><td>" + data[i]["company"] + "</td>";
        myHtmlContent += "<td>" + data[i]["role"].toLowerCase() + "</td>";
        myHtmlContent += "<td>" + getFormattedYoe(data[i]["cleanYoe"]) + "</td>";
        myHtmlContent += "<td>₹ " + data[i]["cleanSalary"].toLocaleString('en-IN') + "</td>";
        myHtmlContent += "<td>" + data[i]["date"] + "</td>";
        myHtmlContent += "<td>" + data[i]["viewCount"] + "</td>";
        myHtmlContent += "<td>" + data[i]["voteCount"] + "</td>";
        myHtmlContent += "<td>" + data[i]["id"] + "</td></tr>";
    }
    tableTbodyRef.innerHTML = myHtmlContent;
};
updatePostsTableContent(0, pageSize);

// Nav pagniation filter
function filterNavData(e) {
    pageNo = parseInt(e.text);
    startIndex = (pageNo - 1) * pageSize;
    endIndex = startIndex + pageSize;
    updatePostsTableContent(startIndex, endIndex);
};

// Increment Nav page numbers
function incrementNavPageNo() {
    if (parseInt(document.getElementById("navPageNo3").text) == nPages) {
        return;
    }
    document.getElementById("navPageNo1").text = parseInt(document.getElementById("navPageNo1").text) + 1;
    document.getElementById("navPageNo2").text = parseInt(document.getElementById("navPageNo2").text) + 1;
    document.getElementById("navPageNo3").text = parseInt(document.getElementById("navPageNo3").text) + 1;
}

// Decrement Nav page numbers
function decrementNavPageNo() {
    if (parseInt(document.getElementById("navPageNo1").text) == 1) {
        return;
    }
    document.getElementById("navPageNo1").text = parseInt(document.getElementById("navPageNo1").text) - 1;
    document.getElementById("navPageNo2").text = parseInt(document.getElementById("navPageNo2").text) - 1;
    document.getElementById("navPageNo3").text = parseInt(document.getElementById("navPageNo3").text) - 1;
}

function resetNavPageNo() {
    document.getElementById("navPageNo1").text = 1;
    document.getElementById("navPageNo2").text = 2;
    document.getElementById("navPageNo3").text = 3;
}

function updateNRows() {
    document.getElementById("nRows").innerHTML = "# rows: " + data.length
}
updateNRows();

function resetData() {
    plotSalaryBarChartData();
    updatePageCount();
    updatePostsTableContent(0, pageSize);
    resetNavPageNo();
    updateNRows();
}

// Toggle to Intern
function makeInternButton() {
    eInternship = document.getElementById("internshipButton");
    eFullTime = document.getElementById("fullTimeButton");
    eFullTime.classList.remove("active");
    eInternship.classList.add("active");

    setFullTimeOrInternship("monthly");
    resetData();
}

// Toggle to Full time
function makeFullTimeButton() {
    eInternship = document.getElementById("internshipButton");
    eFullTime = document.getElementById("fullTimeButton");
    eInternship.classList.remove("active");
    eFullTime.classList.add("active");

    setFullTimeOrInternship("yearly");
    resetData();
}

// Search
function filterSearchIndexes(ixs) {
    window.data = [];
    if (document.getElementById("fullTimeButton").classList.contains("active")) {
        for (i = 0; i < ixs.length; i++) {
            if (allData[ixs[i]]["yrOrPm"] == "yearly") {
                window.data.push(allData[ixs[i]]);
            }
        }
    }
    else if (document.getElementById("internshipButton").classList.contains("active")) {
        for (i = 0; i < ixs.length; i++) {
            if (allData[ixs[i]]["yrOrPm"] == "monthly") {
                window.data.push(allData[ixs[i]]);
            }
        }
    }
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function search(e) {
    var allIxs = [];
    if (e.value.length > 2) {
        txt = e.value.toLowerCase();
        txtSplits = txt.split(" ");
        for (i = 0; i < txtSplits.length; i++) {
            txtToSearch = txtSplits[i];
            if (txtToSearch in invertedIndex) {
                allIxs = allIxs.concat(invertedIndex[txtToSearch]);
            }
        }
        allIxs = [...new Set(allIxs)];
        allIxs.sort(function (a, b) {
            return a - b;
        });;
        filterSearchIndexes(allIxs);
        resetData();
    }
}
const searchText = debounce((e) => search(e));

function _minYoeFilter(e) {
    window.data = [];
    for (i = 0; i < allData.length; i++) {
        if (allData[i]["yoe"] >= parseFloat(e.value)) {
            window.data.push(allData[i]);
        }
    }
    resetData();
}
const minYoeFilter = debounce((e) => _minYoeFilter(e));

function _maxYoeFilter(e) {
    window.data = [];
    for (i = 0; i < allData.length; i++) {
        if (allData[i]["yoe"] <= parseFloat(e.value)) {
            window.data.push(allData[i]);
        }
    }
    resetData();
}
const maxYoeFilter = debounce((e) => _maxYoeFilter(e));

// Most offers
document.getElementById("mostOffers").innerHTML = ""
for (i = 0; i < metaInfo["mostOffersInLastMonth"].length; i++) {
    cc = metaInfo["mostOffersInLastMonth"][i]
    document.getElementById("mostOffers").innerHTML  += "<div class='col'>"
    + cc[0] + "(" + cc[1] + ")" + "</div>"
}

// Stats
document.getElementById("stats").innerHTML = "Total Posts: " + metaInfo["totalPosts"]
+ " | Posts from India: " + metaInfo["totalPostsFromIndia"]
+ " | Last updated: " + metaInfo["lastUpdated"]

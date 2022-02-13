// Data
var data = [];

// Data ix and key (we dropped the keys to reduce data size and save network cost)
keyMap = {
    "id": 0, "voteCount": 1, "viewCount": 2, "date": 3, "company": 4, "role": 5,
    "cleanYoe": 6, "cleanSalary": 7, "yrOrPm": 8, "cleanSalaryTotal": 9, "cleanCompany": 10
}

// Constants
var pageSize = 20;
var nPages = Math.ceil(data.length / pageSize);

function setFullTimeOrInternship(yrOrPm) {
    window.data = [];
    for (i = 0; i < allData.length; i++) {
        if (allData[i][keyMap["yrOrPm"]] == yrOrPm) {
            window.data.push(allData[i]);
        }
    }
}
setFullTimeOrInternship("yearly");

function updatePageCount() {
    window.nPages = Math.ceil(data.length / pageSize);
}

// Reference to the table with posts info
var tableTbodyRef = document.getElementById("postInfo").getElementsByTagName("tbody")[0];

function getAllBaseSalaries() {
    var salaries = [];
    for (i = 0; i < data.length; i++) {
        salaries.push(data[i][keyMap["cleanSalary"]] / 100000)
    }
    return salaries;
}

function getAllTotalSalaries() {
    var salaries = [];
    for (i = 0; i < data.length; i++) {
        if (data[i][keyMap["cleanSalaryTotal"]] != -1) {
            salaries.push(data[i][keyMap["cleanSalaryTotal"]] / 100000);
        }
    }
    return salaries;
}

function plotSalaryBarChartData() {
    salaries = getAllBaseSalaries();
    totalSalaries = getAllTotalSalaries();
    var trace1 = {
        x: salaries,
        name: "base",
        type: "histogram",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var trace2 = {
        x: totalSalaries,
        name: "total",
        type: "histogram",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var layout = {
        title: { text: "# salaries #", font: { size: 12 } },
        height: 400,
        margin: { t: 20, l: 0, r: 0 },
        yaxis: { automargin: true },
        xaxis: { tickprefix: "₹ ", ticksuffix: " lpa" }
    };
    var salaryBarChart = [trace1, trace2];
    Plotly.newPlot("salaryBarChart", salaryBarChart, layout);
}
plotSalaryBarChartData();

function plotTopCompaniesChartData() {
    var companies = [];
    var counts = [];
    for (i = 0; i < metaInfo["top20Companies"].length; i++) {
        companies.push(metaInfo["top20Companies"][i][0])
        counts.push(metaInfo["top20Companies"][i][1])
    }
    var data = [{
        type: "bar",
        x: companies,
        y: counts,
        orientation: "v",
        opacity: 0.5,
        marker: { color: "green" }
    }];
    var layout = {
        title: { text: "# top companies (static) #", font: { size: 12 } },
        margin: { t: 20, l: 25 },
        xaxis: { tickfont: { size: 10 } },
        showlegend: false
    }
    Plotly.newPlot("topCompaniesBarChart", data, layout);
}
plotTopCompaniesChartData();

function plotSalaryYoeBinsChart() {
    var yoeBin1 = []; var yoeBin2 = []; var yoeBin3 = []; var yoeBin4 = []; var yoeBin5 = [];
    for (i = 0; i < data.length; i++) {
        if (data[i][keyMap["cleanYoe"]] >= 0 && data[i][keyMap["cleanYoe"]] < 1) {
            yoeBin1.push(data[i][keyMap["cleanSalary"]]);
        }
        else if (data[i][keyMap["cleanYoe"]] >= 1 && data[i][keyMap["cleanYoe"]] < 3) {
            yoeBin2.push(data[i][keyMap["cleanSalary"]]);
        }
        else if (data[i][keyMap["cleanYoe"]] >= 3 && data[i][keyMap["cleanYoe"]] < 6) {
            yoeBin3.push(data[i][keyMap["cleanSalary"]]);
        }
        else if (data[i][keyMap["cleanYoe"]] >= 6 && data[i][keyMap["cleanYoe"]] < 9) {
            yoeBin4.push(data[i][keyMap["cleanSalary"]]);
        }
        else if (data[i][keyMap["cleanYoe"]] >= 9) {
            yoeBin5.push(data[i][keyMap["cleanSalary"]]);
        }
    }
    var trace1 = {
        y: yoeBin1,
        type: "box",
        name: "0-1",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var trace2 = {
        y: yoeBin2,
        type: "box",
        name: "1-3",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var trace3 = {
        y: yoeBin3,
        type: "box",
        name: "3-6",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var trace4 = {
        y: yoeBin4,
        type: "box",
        name: "6-9",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var trace5 = {
        y: yoeBin5,
        type: "box",
        name: "9+",
        opacity: 0.5,
        marker: { color: "green" }
    };
    var layout = {
        title: { text: "# yoe bins (base) #", font: { size: 12 } }, margin: { t: 20, l: 30 },
        xaxis: { tickfont: { size: 10 } },
        showlegend: false
    }

    var traces = [trace1, trace2, trace3, trace4, trace5];
    Plotly.newPlot("salaryYoeBinsChart", traces, layout);
}
plotSalaryYoeBinsChart();

function plotSalaryTotalYoeBinsChart() {
    var yoeBin1 = []; var yoeBin2 = []; var yoeBin3 = []; var yoeBin4 = []; var yoeBin5 = [];
    for (i = 0; i < data.length; i++) {
        if (data[i][keyMap["cleanSalaryTotal"]] != -1) {
            if (data[i][keyMap["cleanYoe"]] >= 0 && data[i][keyMap["cleanYoe"]] < 1) {
                yoeBin1.push(data[i][keyMap["cleanSalaryTotal"]]);
            }
            else if (data[i][keyMap["cleanYoe"]] >= 1 && data[i][keyMap["cleanYoe"]] < 3) {
                yoeBin2.push(data[i][keyMap["cleanSalaryTotal"]]);
            }
            else if (data[i][keyMap["cleanYoe"]] >= 3 && data[i][keyMap["cleanYoe"]] < 6) {
                yoeBin3.push(data[i][keyMap["cleanSalaryTotal"]]);
            }
            else if (data[i][keyMap["cleanYoe"]] >= 6 && data[i][keyMap["cleanYoe"]] < 9) {
                yoeBin4.push(data[i][keyMap["cleanSalaryTotal"]]);
            }
            else if (data[i][keyMap["cleanYoe"]] >= 9) {
                yoeBin5.push(data[i][keyMap["cleanSalaryTotal"]]);
            }
        }
    }
    var trace1 = {
        y: yoeBin1,
        type: "box",
        name: "0-1",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var trace2 = {
        y: yoeBin2,
        type: "box",
        name: "1-3",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var trace3 = {
        y: yoeBin3,
        type: "box",
        name: "3-6",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var trace4 = {
        y: yoeBin4,
        type: "box",
        name: "6-9",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var trace5 = {
        y: yoeBin5,
        type: "box",
        name: "9+",
        opacity: 0.5,
        marker: { color: "red" }
    };
    var layout = {
        title: { text: "# yoe bins (total) #", font: { size: 12 } }, margin: { t: 20, l: 30 },
        xaxis: { tickfont: { size: 10 } },
        showlegend: false
    }

    var traces = [trace1, trace2, trace3, trace4, trace5];
    Plotly.newPlot("salaryTotalYoeBinsChart", traces, layout);
}
plotSalaryTotalYoeBinsChart();

function getFormattedYoe(yoe) {
    if (yoe == -1) {
        return "<button class='btn-danger'>n/a</button>";
    }
    else {
        return yoe;
    }
}

function getFormattedTotalSalary(totalSalary) {
    if (totalSalary == -1) {
        return "<button class='btn-danger'>n/a</button>";
    }
    else {
        return "₹ " + totalSalary.toLocaleString("en-IN");
    }
}

// Add rows to the postInfo table
function updatePostsTableContent(startIndex, endIndex) {
    var myHtmlContent = "";
    endIndex = Math.min(data.length, endIndex)
    for (var i = startIndex; i < endIndex; i++) {
        myHtmlContent += "<tr><td>" + data[i][keyMap["company"]] + "</td>";
        myHtmlContent += "<td>" + data[i][keyMap["role"]].toLowerCase() + "</td>";
        myHtmlContent += "<td>" + getFormattedYoe(data[i][keyMap["cleanYoe"]]) + "</td>";
        myHtmlContent += "<td>base: ₹ " + data[i][keyMap["cleanSalary"]].toLocaleString("en-IN");
        myHtmlContent += "<br>total: " + getFormattedTotalSalary(data[i][keyMap["cleanSalaryTotal"]]) + "</td>";
        myHtmlContent += "<td>" + data[i][keyMap["date"]] + "</td>";
        myHtmlContent += "<td>" + data[i][keyMap["viewCount"]] + "</td>";
        myHtmlContent += "<td>" + data[i][keyMap["voteCount"]] + "</td>";
        myHtmlContent += "<td><a href=https://leetcode.com/discuss/general-discussion/"+ data[i][keyMap["id"]] + ">"
                            + data[i][keyMap["id"]] + 
                        "</a></td></tr>";
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
    plotSalaryYoeBinsChart();
    plotSalaryTotalYoeBinsChart();
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
            if (allData[ixs[i]][keyMap["yrOrPm"]] == "yearly") {
                window.data.push(allData[ixs[i]]);
            }
        }
    }
    else if (document.getElementById("internshipButton").classList.contains("active")) {
        for (i = 0; i < ixs.length; i++) {
            if (allData[ixs[i]][keyMap["yrOrPm"]] == "monthly") {
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
        // Reset you range (WIP)
        document.getElementById("minYoe").value = "";
        document.getElementById("minYoe").value = "";
        resetData();
    }
}
const searchText = debounce((e) => search(e));


// Min-Max Yoe
function _yoeFilter(e) {
    minYoe = document.getElementById("minYoe").value;
    maxYoe = document.getElementById("maxYoe").value;
    if (minYoe.length == 0) {
        minYoe = -0.99;
    }
    else {
        minYoe = parseFloat(minYoe)
    }
    if (maxYoe.length == 0) {
        maxYoe = 30.0;
    }
    else {
        maxYoe = parseFloat(maxYoe)
    }
    window.data = [];
    for (i = 0; i < allData.length; i++) {
        yoe = parseFloat(allData[i][keyMap["cleanYoe"]]);
        if (yoe >= minYoe && yoe <= maxYoe) {
            window.data.push(allData[i]);
        }
    }
    // Reset search (WIP)
    document.getElementById("search").value = "";
    resetData();
}
const yoeFilter = debounce((e) => _yoeFilter(e));

// Most offers
document.getElementById("mostOffers").innerHTML = ""
for (i = 0; i < metaInfo["mostOffersInLastMonth"].length; i++) {
    cc = metaInfo["mostOffersInLastMonth"][i]
    document.getElementById("mostOffers").innerHTML += "<div class='col'>"
        + cc[0] + "(" + cc[1] + ")" + "</div>"
}

// Stats
document.getElementById("stats").innerHTML = "Total Posts: " + metaInfo["totalPosts"]
    + " | Posts from India: " + metaInfo["totalPostsFromIndia"]
    + " | Posts with Total Comp: " + metaInfo["totalPostsWithTotalComp"]
    + " | Last updated: " + metaInfo["lastUpdated"]


// Sorting by salary
var sortedAsc = false;

function compareObjectsAsc(object1, object2, key) {
    const obj1 = object1[keyMap[key]];
    const obj2 = object2[keyMap[key]];
    if (obj1 < obj2) {
        return -1;
    }
    if (obj1 > obj2) {
        return 1;
    }
    return 0
}

function compareObjectsDesc(object1, object2, key) {
    const obj1 = object1[keyMap[key]];
    const obj2 = object2[keyMap[key]];
    if (obj1 > obj2) {
        return -1;
    }
    if (obj1 < obj2) {
        return 1;
    }
    return 0
}

function sortBySalary(e) {
    if (sortedAsc == false) {
        data.sort((post1, post2) => {
            return compareObjectsAsc(post1, post2, e.id);
        });
        sortedAsc = true;
    }
    else {
        data.sort((post1, post2) => {
            return compareObjectsDesc(post1, post2, e.id);
        });
        sortedAsc = false;
    }
    resetData();
}

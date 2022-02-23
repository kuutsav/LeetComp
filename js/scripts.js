// Data
var data = [];
var companyData = [];

// Data ix and key (we dropped the keys to reduce data size and save network cost)
keyMap = {
    "id": 0,
    "voteCount": 1,
    "viewCount": 2,
    "date": 3,
    "company": 4,
    "role": 5,
    "cleanYoe": 6,
    "cleanSalary": 7,
    "yrOrPm": 8,
    "cleanSalaryTotal": 9,
    "cleanCompany": 10
}

baseSalaryLabels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
totalSalaryLabels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];

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

var tableTbodyRef = document.getElementById("postInfo").getElementsByTagName("tbody")[0];

function prepend0orNot(key) {
    if (parseInt(key) < 10) {
        return "0" + key;
    } else {
        return key;
    }
}

function getAllBaseorTotalSalariesByCuts(baseOrTotal) {
    var salaries = {};
    if (baseOrTotal == "cleanSalary") {
        label = baseSalaryLabels;
    } else {
        label = totalSalaryLabels;
    }
    for (i = 0; i < data.length; i++) {
        salary = data[i][keyMap[baseOrTotal]] / 100000;
        for (j = 0; j < label.length - 1; j++) {
            if (salary >= label[j] && salary < label[j + 1]) {
                key = prepend0orNot(label[j])
                if (!(key in salaries)) {
                    salaries[key] = 1;
                } else {
                    salaries[key] += 1;
                }
                break;
            }
        }
    }
    var keys = Object.keys(salaries); // or loop over the object to get the array
    // keys will be in any order
    keys.sort(); // maybe use custom sort, to change direction use .reverse()
    // keys now will be in wanted order
    var salariesXY = [];
    for (var i = 0; i < keys.length; i++) { // now lets iterate in sort order
        var key = keys[i];
        salariesXY.push({
            "x": "₹" + key + "-" + prepend0orNot(parseInt(key) + 5) + " lpa",
            "y": salaries[key]
        })
    }
    return salariesXY;
}

const ctx = document.getElementById('salaryBarChartJs').getContext('2d');

function plotSalaryBarChartData(baseOrTotal) {
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Base Salaries",
                data: getAllBaseorTotalSalariesByCuts(baseOrTotal),
                backgroundColor: "rgba(87,177,127,1)",
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: false,
                    barPercentage: 1.3,
                    ticks: {
                        max: 10,
                    }
                }, {
                    display: true,
                    ticks: {
                        autoSkip: false,
                        max: 4,
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        }
    })
};
plotSalaryBarChartData("cleanSalary");

function plotSalaryYoeBinsChart() {
    var yoeBin1 = [];
    var yoeBin2 = [];
    var yoeBin3 = [];
    var yoeBin4 = [];
    var yoeBin5 = [];
    for (i = 0; i < data.length; i++) {
        if (data[i][keyMap["cleanYoe"]] >= 0 && data[i][keyMap["cleanYoe"]] < 1) {
            yoeBin1.push(data[i][keyMap["cleanSalary"]]);
        } else if (data[i][keyMap["cleanYoe"]] >= 1 && data[i][keyMap["cleanYoe"]] < 3) {
            yoeBin2.push(data[i][keyMap["cleanSalary"]]);
        } else if (data[i][keyMap["cleanYoe"]] >= 3 && data[i][keyMap["cleanYoe"]] < 6) {
            yoeBin3.push(data[i][keyMap["cleanSalary"]]);
        } else if (data[i][keyMap["cleanYoe"]] >= 6 && data[i][keyMap["cleanYoe"]] < 9) {
            yoeBin4.push(data[i][keyMap["cleanSalary"]]);
        } else if (data[i][keyMap["cleanYoe"]] >= 9) {
            yoeBin5.push(data[i][keyMap["cleanSalary"]]);
        }
    }
    var trace1 = {
        y: yoeBin1,
        type: "box",
        name: "0-1",
        opacity: 0.5,
        marker: {
            color: "green"
        }
    };
    var trace2 = {
        y: yoeBin2,
        type: "box",
        name: "1-3",
        opacity: 0.5,
        marker: {
            color: "green"
        }
    };
    var trace3 = {
        y: yoeBin3,
        type: "box",
        name: "3-6",
        opacity: 0.5,
        marker: {
            color: "green"
        }
    };
    var trace4 = {
        y: yoeBin4,
        type: "box",
        name: "6-9",
        opacity: 0.5,
        marker: {
            color: "green"
        }
    };
    var trace5 = {
        y: yoeBin5,
        type: "box",
        name: "9+",
        opacity: 0.5,
        marker: {
            color: "green"
        }
    };
    var layout = {
        title: {
            text: "# yoe bins (base) #",
            font: {
                size: 12
            }
        },
        margin: {
            t: 20,
            l: 30
        },
        xaxis: {
            tickfont: {
                size: 10
            }
        },
        showlegend: false
    }

    var traces = [trace1, trace2, trace3, trace4, trace5];
    Plotly.newPlot("salaryYoeBinsChart", traces, layout);
}
plotSalaryYoeBinsChart();


function getFormattedYoe(yoe) {
    if (yoe == -1) {
        return "<button class='btn-danger'>n/a</button>";
    } else {
        return yoe;
    }
}

function getFormattedTotalSalary(totalSalary) {
    if (totalSalary == -1) {
        return "<button class='btn-danger'>n/a</button>";
    } else {
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
        myHtmlContent += "<td><a href=https://leetcode.com/discuss/compensation/" + data[i][keyMap["id"]] + ">" +
            data[i][keyMap["id"]] +
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
    _SearchYoeFilter();
    resetData();
}

// Toggle to Full time
function makeFullTimeButton() {
    eInternship = document.getElementById("internshipButton");
    eFullTime = document.getElementById("fullTimeButton");
    eInternship.classList.remove("active");
    eFullTime.classList.add("active");

    setFullTimeOrInternship("yearly");
    _SearchYoeFilter();
    resetData();
}

// Most offers
document.getElementById("mostOffers").innerHTML = ""
for (i = 0; i < Math.min(metaInfo["top20Companies"].length, 10); i++) {
    cc = metaInfo["top20Companies"][i]
    document.getElementById("mostOffers").innerHTML += "<div class='col'>" +
        cc[0] + "(" + cc[1] + ")" + "</div>"
}

document.getElementById("mostOffers30").innerHTML = ""
for (i = 0; i < metaInfo["mostOffersInLastMonth"].length; i++) {
    cc = metaInfo["mostOffersInLastMonth"][i]
    document.getElementById("mostOffers30").innerHTML += "<div class='col'>" +
        cc[0] + "(" + cc[1] + ")" + "</div>"
}

// Stats
document.getElementById("stats").innerHTML = "Total Posts: " + metaInfo["totalPosts"] +
    " | Posts from India: " + metaInfo["totalPostsFromIndia"] +
    " | Posts with Total Comp: " + metaInfo["totalPostsWithTotalComp"] +
    " | Last updated: " + metaInfo["lastUpdated"]


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
    } else {
        data.sort((post1, post2) => {
            return compareObjectsDesc(post1, post2, e.id);
        });
        sortedAsc = false;
    }
    resetData();
}


// Search and Min-Max yoe
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

function filterSearchIndexes(ixs) {
    if (document.getElementById("fullTimeButton").classList.contains("active")) {
        for (i = 0; i < ixs.length; i++) {
            if (allData[ixs[i]][keyMap["yrOrPm"]] == "yearly") {
                window.data.push(allData[ixs[i]]);

            }
        }
    } else if (document.getElementById("internshipButton").classList.contains("active")) {
        for (i = 0; i < ixs.length; i++) {
            if (allData[ixs[i]][keyMap["yrOrPm"]] == "monthly") {
                window.data.push(allData[ixs[i]]);
            }
        }
    }
}

function search(e) {
    var allIxs = [];
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
}

function _SearchYoeFilter() {
    minYoe = document.getElementById("minYoe").value;
    maxYoe = document.getElementById("maxYoe").value;
    if (minYoe.length == 0) {
        minYoe = -0.99;
    } else {
        minYoe = parseFloat(minYoe)
    }
    if (maxYoe.length == 0) {
        maxYoe = 30.0;
    } else {
        maxYoe = parseFloat(maxYoe)
    }

    window.data = [];
    if (document.getElementById("search").value.length > 2) {
        search(document.getElementById("search"));
    } else {
        window.data = allData;
    }
    tempData = [];
    for (i = 0; i < window.data.length; i++) {
        yoe = parseFloat(window.data[i][keyMap["cleanYoe"]]);
        if (yoe >= minYoe && yoe <= maxYoe) {
            tempData.push(window.data[i]);
        }
    }
    window.data = tempData;
    resetData();
}

const SearchYoeFilter = debounce((e) => _SearchYoeFilter());
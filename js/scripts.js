/////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Data
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


////////////////////////////////////////////////////////////////////////////////////////////////// Constants and Methods
baseSalaryLabels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
totalSalaryLabels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
    105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200
];

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Plots
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
                key = label[j]
                if (!(key in salaries)) {
                    salaries[key] = 1;
                } else {
                    salaries[key] += 1;
                }
                break;
            }
        }
    }
    var keyValues = [];
    for (var key in salaries) {
        keyValues.push([key, salaries[key]])
    }
    keyValues.sort(function compare(kv1, kv2) {
        return parseInt(kv1[0]) - parseInt(kv2[0])
    })

    var salariesXY = [];
    for (var i = 0; i < keyValues.length; i++) {
        key = keyValues[i][0];
        salariesXY.push({
            "x": "₹" + parseInt(key) + "-" + (parseInt(key) + 5) + " lpa",
            "y": keyValues[i][1]
        })
    }
    return salariesXY;
}

function getPercentile(data, percentile) {
    data.sort(numSort);
    var index = (percentile / 100) * data.length;
    var result;
    if (Math.floor(index) == index) {
        result = (data[(index - 1)] + data[index]) / 2;
    } else {
        result = data[Math.floor(index)];
    }
    return result;
}

function numSort(a, b) {
    return a - b;
}

function getBoxPlotData(baseOrTotal, minYoe, maxYoe) {
    var boxData = [];
    var salaries = [];
    for (i = 0; i < data.length; i++) {
        if (data[i][keyMap["cleanYoe"]] >= minYoe && data[i][keyMap["cleanYoe"]] < maxYoe) {
            if (data[i][keyMap[baseOrTotal]] != -1) {
                salaries.push(data[i][keyMap[baseOrTotal]] / 100000);
            }
        }
    }
    boxData.push(Math.min(...salaries));
    boxData.push(getPercentile(salaries, 25));
    boxData.push(getPercentile(salaries, 50));
    boxData.push(getPercentile(salaries, 75) - getPercentile(salaries, 25));
    boxData.push(salaries.reduce((a, b) => a + b, 0) / salaries.length);
    boxData.push(getPercentile(salaries, 75));
    boxData.push(Math.max(...salaries));
    return boxData;
}

function plotSalaryBarChartData(baseOrTotal) {
    document.getElementById("salaryBarChart").innerHTML = '<canvas id="salaryBarChartJs" width="400" height="400"></canvas>';
    const ctx = document.getElementById("salaryBarChartJs").getContext("2d");
    if (baseOrTotal == "cleanSalary") {
        label = "base pay";
    } else {
        label = "total pay";
    }
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: getAllBaseorTotalSalariesByCuts(baseOrTotal),
                backgroundColor: "rgba(87,177,127,1)",
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "yearly pay (x) / bin counts (y)",
                    font: {
                        size: 9
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    })
};
plotSalaryBarChartData("cleanSalaryTotal");

function plotSalaryYoeBinsChartData(baseOrTotal) {
    document.getElementById("salaryYoeBinsChart").innerHTML = '<canvas id="salaryYoeBinsChartJs" width="400" height="400"></canvas>';
    const ctx = document.getElementById("salaryYoeBinsChartJs").getContext("2d");
    if (baseOrTotal == "cleanSalary") {
        label = "base pay";
    } else {
        label = "total pay";
    }
    var myChart = new Chart(ctx, {
        type: "boxplot",
        data: {
            labels: ["0-1", "1-3", "3-6", "6-9", "9+"],
            datasets: [{
                label: label,
                data: [getBoxPlotData(baseOrTotal, 0, 1), getBoxPlotData(baseOrTotal, 1, 3),
                    getBoxPlotData(baseOrTotal, 3, 6), getBoxPlotData(baseOrTotal, 6, 9),
                    getBoxPlotData(baseOrTotal, 9, 30)
                ],
                backgroundColor: "rgba(87,177,127,1)",
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "yoe bins (x) / yearly pay in ₹ lpa (y)",
                    font: {
                        size: 9
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    bodyFont: {
                        size: 8
                    }
                }
            }
        }
    })
};
plotSalaryYoeBinsChartData("cleanSalaryTotal");


//////////////////////////////////////////////////////////////////////////////////////////////////////////////// Buttons
function resetData() {
    plotSalaryBarChartData(getActiveBaseOrTotalPay());
    plotSalaryYoeBinsChartData(getActiveBaseOrTotalPay());
    updatePageCount();
    updatePostsTableContent(0, pageSize);
    resetNavPageNo();
    updateNRows();
}

// Toggle to Total Pay
function makeTotalPayButton() {
    eBase = document.getElementById("basePayButton");
    eTotal = document.getElementById("totalPayButton");
    eBase.classList.remove("active");
    eTotal.classList.add("active");

    _SearchYoeFilter();
}

// Toggle to Base Pay
function makeBasePayButton() {
    eBase = document.getElementById("basePayButton");
    eTotal = document.getElementById("totalPayButton");
    eTotal.classList.remove("active");
    eBase.classList.add("active");

    _SearchYoeFilter();
}

// Toggle to Intern
function makeInternButton() {
    eInternship = document.getElementById("internshipButton");
    eFullTime = document.getElementById("fullTimeButton");
    eFullTime.classList.remove("active");
    eInternship.classList.add("active");

    setFullTimeOrInternship("monthly");
    _SearchYoeFilter();
}

// Toggle to Full time
function makeFullTimeButton() {
    eInternship = document.getElementById("internshipButton");
    eFullTime = document.getElementById("fullTimeButton");
    eInternship.classList.remove("active");
    eFullTime.classList.add("active");

    setFullTimeOrInternship("yearly");
    _SearchYoeFilter();
}

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Table
function getActiveBaseOrTotalPay() {
    if (document.getElementById("basePayButton").classList.contains("active")) {
        return "cleanSalary";
    } else {
        return "cleanSalaryTotal";
    }
}

function getFormattedYoe(yoe) {
    if (yoe == -1) {
        return '<button class="btn-danger">n/a</button>';
    } else {
        return yoe;
    }
}

function getFormattedTotalSalary(totalSalary) {
    if (totalSalary == -1) {
        return '<button class="btn-danger">n/a</button>';
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


///////////////////////////////////////////////////////////////////////////////////////////////////////// Static content
// Most offers
document.getElementById("mostOffers").innerHTML = ""
for (i = 0; i < Math.min(metaInfo["top20Companies"].length, 10); i++) {
    cc = metaInfo["top20Companies"][i]
    document.getElementById("mostOffers").innerHTML += '<div class="col">' +
        cc[0] + "(" + cc[1] + ")" + "</div>"
}

document.getElementById("mostOffers30").innerHTML = ""
for (i = 0; i < metaInfo["mostOffersInLastMonth"].length; i++) {
    cc = metaInfo["mostOffersInLastMonth"][i]
    document.getElementById("mostOffers30").innerHTML += '<div class="col">' +
        cc[0] + "(" + cc[1] + ")" + "</div>"
}

// Stats
document.getElementById("stats").innerHTML = "Total Posts: " + metaInfo["totalPosts"] +
    " | Posts from India: " + metaInfo["totalPostsFromIndia"] +
    " | Posts with Total Comp: " + metaInfo["totalPostsWithTotalComp"] +
    " | Last updated: " + metaInfo["lastUpdated"]



//////////////////////////////////////////////////////////////////////////////////// Sort and (Search + Min-Max) Filters
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
        if (document.getElementById("fullTimeButton").classList.contains("active")) {
            for (i = 0; i < allData.length; i++) {
                if (allData[i][keyMap["yrOrPm"]] == "yearly") {
                    window.data.push(allData[i]);

                }
            }
        } else if (document.getElementById("internshipButton").classList.contains("active")) {
            for (i = 0; i < allData.length; i++) {
                if (allData[i][keyMap["yrOrPm"]] == "monthly") {
                    window.data.push(allData[i]);
                }
            }
        }
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
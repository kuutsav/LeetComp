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
const stepSize = 2;
baseSalaryLabels = [...Array(51)].map((_, i) => 0 + i * stepSize);
totalSalaryLabels = [...Array(101)].map((_, i) => 0 + i * stepSize);

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
            "x": "₹" + parseInt(key) + "-" + (parseInt(key) + stepSize) + " lpa",
            "y": keyValues[i][1]
        })
    }
    console.log(salariesXY)
    return salariesXY;
}

function getPercentile(data, percentile) {
    data.sort(function (a, b) {
        return a - b;
    });
    var index = (percentile / 100) * data.length;
    var result;
    if (Math.floor(index) == index) {
        result = (data[(index - 1)] + data[index]) / 2;
    } else {
        result = data[Math.floor(index)];
    }
    return result;
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
    document.getElementById("salaryBarChart").innerHTML = '<canvas id="salaryBarChartJs" width="350" height="350"></canvas>';
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
                    },
                    ticks: {
                        display: true,
                        autoSkip: true,
                        maxTicksLimit: 12,
                        minRotation: 30,
                        maxRotation: 30
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    // text: "yearly pay (x) / bin counts (y)",
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
    document.getElementById("salaryYoeBinsChart").innerHTML = '<canvas id="salaryYoeBinsChartJs" width="300" height="300"></canvas>';
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
                yAxis: {
                    display: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return "₹" + value + " lpa";
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        minRotation: 30,
                        maxRotation: 30
                    }
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    // text: "yoe bins (x) / yearly pay in ₹ lpa (y)",
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

function getCountByMonth() {
    var countByMonth = {};
    for (i = 0; i < data.length; i++) {
        key = data[i][keyMap["date"]].substr(2, 5);
        if (!(key in countByMonth)) {
            countByMonth[key] = 1;
        } else {
            countByMonth[key] += 1;
        }
    }
    var sortedCountByMonth = {};
    var keys = Object.keys(countByMonth);
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
        sortedCountByMonth[keys[i]] = countByMonth[keys[i]];
    }
    return sortedCountByMonth;
}

function plotCountsByMonthChart() {
    document.getElementById("countsByMonthChart").innerHTML = '<canvas id="countsByMonthChartJs" width="300" height="300"></canvas>';
    const ctx = document.getElementById("countsByMonthChartJs").getContext("2d");
    counts = getCountByMonth();
    new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "",
                data: Object.values(counts),
                backgroundColor: "rgba(87,177,127,1)",
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        autoSkip: true,
                        maxTicksLimit: 9,
                        minRotation: 30,
                        maxRotation: 30
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
                    // text: "yearly pay (x) / bin counts (y)",
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
plotCountsByMonthChart();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////// Buttons
function resetData() {
    plotSalaryBarChartData(getActiveBaseOrTotalPay());
    plotSalaryYoeBinsChartData(getActiveBaseOrTotalPay());
    plotCountsByMonthChart();
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
    document.getElementById("nRows").innerHTML = data.length + " rows"
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
        myHtmlContent += "<tr><td><span class='primaryText'>" + data[i][keyMap["company"]] + "</span><p class='secondaryText'>" + 
            data[i][keyMap["role"]] + "</p></td>";
        myHtmlContent += "<td>" + getFormattedYoe(data[i][keyMap["cleanYoe"]]) + "</td>";
        myHtmlContent += "<td>total: " + getFormattedTotalSalary(data[i][keyMap["cleanSalaryTotal"]]);
        myHtmlContent += "<p class='secondaryText'>base: ₹ " + data[i][keyMap["cleanSalary"]].toLocaleString("en-IN") + "</p></td>";
        myHtmlContent += "<td>" + data[i][keyMap["date"]] + "</td>";
        myHtmlContent += "<td>" + data[i][keyMap["voteCount"]] + "<p class='secondaryText'>(" +
            data[i][keyMap["viewCount"]] + ")</p></td>";
        myHtmlContent += "<td><a class='postHref' href=https://leetcode.com/discuss/compensation/" + data[i][keyMap["id"]] + ">" +
            data[i][keyMap["id"]] + "</a></td></tr>";
    }
    tableTbodyRef.innerHTML = myHtmlContent;
};
updatePostsTableContent(0, pageSize);


///////////////////////////////////////////////////////////////////////////////////////////////////////// Static content
// Most offers
document.getElementById("mostOffers").innerHTML = ""
for (i = 0; i < Math.min(metaInfo["top20Companies"].length, 8); i++) {
    cc = metaInfo["top20Companies"][i]
    document.getElementById("mostOffers").innerHTML += '<div class="col">' +
        cc[0] + "(" + cc[1] + ")" + "</div>"
}

document.getElementById("mostOffers30").innerHTML = ""
for (i = 0; i < Math.min(metaInfo["mostOffersInLastMonth"].length, 8); i++) {
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

    window.data_indexes = [];
    if (document.getElementById("search").value.length > 2) {
        search(document.getElementById("search"));
    } else {
        if (document.getElementById("fullTimeButton").classList.contains("active")) {
            for (i = 0; i < allData.length; i++) {
                if (allData[i][keyMap["yrOrPm"]] == "yearly") {
                    window.data_indexes.push(i);

                }
            }
        } else if (document.getElementById("internshipButton").classList.contains("active")) {
            for (i = 0; i < allData.length; i++) {
                if (allData[i][keyMap["yrOrPm"]] == "monthly") {
                    window.data_indexes.push(i);
                }
            }
        }
    }

    // Filter for year - "yyyy-MM-dd"
    const year_data_indexes = _FilterDataFromStartDate(window.data_indexes)
    const base_sal_filtered_data_indexes = _SearchBaseSalaryFilter(year_data_indexes)
    const total_sal_filtered_data_indexes = _SearchTotalSalaryFilter(base_sal_filtered_data_indexes)

    // filter for YOE
    tempData = [];
    for (i = 0; i < total_sal_filtered_data_indexes.length; i++) {
        index = total_sal_filtered_data_indexes[i]
        yoe = parseFloat(allData[index][keyMap["cleanYoe"]]);
        if (yoe >= minYoe && yoe <= maxYoe) {
            tempData.push(allData[index]);
        }
    }
    window.data = tempData;
    resetData();
}

function _FilterDataFromStartDate(data_indexes) {
    // Filter for year - "yyyy-MM-dd"
    const filtered_data_indexes = []
    if (document.getElementById("data-start-date").value.length == 10) {
        const startDateStr = document.getElementById("data-start-date").value;
        try {
            const startDate = new Date(Date.parse(startDateStr));

            for (i = 0; i < data_indexes.length; i++) {
                const index = data_indexes[i]
                const dateString = allData[index][keyMap["date"]];
                const date = new Date(Date.parse(dateString));

                if (date > startDate) {
                    filtered_data.push(index);
                }
            }
        } catch (error) {
            console.error('Failed to parse startDate: ' + startDateStr, error);
            return data_indexes;
        }
    }
    return filtered_data_indexes;
}

function _SearchBaseSalaryFilter(data_indexes) {
    const filtered_data_indexes = []
    try {
        minBase = document.getElementById("minBase").value;
        maxBase = document.getElementById("maxBase").value;
        if (minBase.length == 0) {
            minBase = 0;
        } else {
            minBase = parseFloat(minBase)
        }
        if (maxBase.length == 0) {
            maxBase = 1200;// 1200 lacs
        } else {
            maxBase = parseFloat(maxBase)
        }
        minBase = maxBase * 100000; 
        minBase = minBase * 100000; 


        
        for (i = 0; i < data_indexes.length; i++) {
            index = data_indexes[i]
            baseSalary = parseFloat(allData[index][keyMap["cleanSalary"]]);
            if (baseSalary >= minBase && baseSalary <= maxBase) {
                filtered_data_indexes.push(index);
            }
        }

        return filtered_data_indexes;
    } catch (error) {
        console.error('Failed _SearchBaseSalaryFilter: ', error);
        return data_indexes;
    }

}

function _SearchTotalSalaryFilter(data_indexes) {
    const filtered_data_indexes = []
    try {
        minTotal = document.getElementById("minTotal").value;
        maxTotal = document.getElementById("maxTotal").value;
        if (minTotal.length == 0) {
            minTotal = 0;
        } else {
            minTotal = parseFloat(minTotal)
        }
        if (maxTotal.length == 0) {
            maxTotal = 1200;// 1200 lacs
        } else {
            maxTotal = parseFloat(maxTotal)
        }
        maxTotal = maxTotal * 100000; 
        minTotal = minTotal * 100000; 

        
        for (i = 0; i < data_indexes.length; i++) {
            index = data_indexes[i]
            totalSalary = parseFloat(allData[index][keyMap["cleanSalaryTotal"]]);
            if (totalSalary >= minTotal && totalSalary <= maxTotal) {
                filtered_data_indexes.push(index);
            }
        }

        return filtered_data_indexes
    } catch (error) {
        console.error('Failed _SearchTotalSalaryFilter: ', error);
        return data_indexes;
    }
}

const SearchYoeFilter = debounce((e) => _SearchYoeFilter());
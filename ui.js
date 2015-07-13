/**
 * Created by ewind on 15/7/12.
 */
document.getElementById("count-not-passed").addEventListener("click", chgNotPassed, false);
document.getElementById("score-5-grade").addEventListener("click", chg5Grade, false);
document.getElementById("score-2-grade").addEventListener("click", chg2Grade, false);

function chgNotPassed() {
    var notPassedBtn = document.getElementById("count-not-passed");
    switch (notPassedBtn.innerHTML) {
        case "Include":
            notPassedBtn.innerHTML = "Not Include"; break;
        case "Not Include":
            notPassedBtn.innerHTML = "Include";
    }
    calculate();
}
function chg5Grade() {
    var fiveGradeBtn = document.getElementById("score-5-grade");
    switch (fiveGradeBtn.innerHTML) {
        case "Max":
            fiveGradeBtn.innerHTML = "Mid"; break;
        case "Mid":
            fiveGradeBtn.innerHTML = "Min"; break;
        case "Min":
            fiveGradeBtn.innerHTML = "Max";
    }
    calculate();
}
function chg2Grade() {
    var twoGradeBtn = document.getElementById("score-2-grade");
    switch (twoGradeBtn.innerHTML) {
        case "Ignore":
            twoGradeBtn.innerHTML = "80"; break;
        case "80":
            twoGradeBtn.innerHTML = "60"; break;
        case "60":
            twoGradeBtn.innerHTML = "Ignore";
    }
    calculate();
}
function showResult(courses, arithmeticAvg, weightAvg, gpaResult, semestersRecord) {
    var logBox = document.getElementById("log");
    if (isNaN(arithmeticAvg) || isNaN(weightAvg)) {
        document.getElementById("result").innerHTML = "Incorrect format.";
        return;
    }
    document.getElementById("arithmetic-avg").innerHTML = arithmeticAvg;
    document.getElementById("weighted-avg").innerHTML = weightAvg;
    var gpaTypes = ['typical-4.0', 'improved-4.0-1', 'improved-4.0-2', 'pku-4.0', 'canada-4.3', 'ustc-4.3', 'sjtu-4.3'];
    for (var i = 0; i < gpaTypes.length; i++) {
        document.getElementById(gpaTypes[i]).innerHTML = gpaResult[gpaTypes[i]];
    }
    document.getElementById("result").removeAttribute("hidden");
    document.getElementById("result-graph").removeAttribute("hidden");
    document.getElementById("result-list").removeAttribute("hidden");
    logBox.value = "";
    for (i = 0; i < courses.length; i++) {
        var score = courses[i]['score'];
        var credit = courses[i]['credit'];
        logBox.value += [credit, score, courses[i]['name']].join('\t');
        if (i < courses.length - 1) logBox.value += '\n';
    }
    drawSemesterGPA();
    function drawSemesterGPA() {
        var graph = document.getElementById('graph');
        graph.innerHTML = "";
        var gpaArray = [];
        for (var semester in semestersRecord) {
            var record = semestersRecord[semester];
            record[semester] = semester;

            var year = parseInt(semester);
            var season = semester[5];
            // reform semesters dict into an order array
            for (var j = 0; j < gpaArray.length; j++) {
                var arrItem = gpaArray[j];
                if (parseInt(arrItem[name]) == year && season == '秋') break;
                else if (parseInt(arrItem[name] + 1 == year) && season == '春') break;
            }
            gpaArray.splice(j, 0, record);
        }
        gpaArray = gpaArray.reverse();
        for (var i = 0; i < gpaArray.length; i++) {
            addBar(gpaArray[i]['name'], gpaArray[i]['gpa']);
        }
        function addBar(name, gpa) {
            var graph = document.getElementById('graph');
            var newBar = document.createElement('div');
            newBar.className = "bar";
            newBar.setAttribute("style", "display:block;width:" + (gpa / 4.3) * 100 + "%");
            newBar.innerHTML = name.substring(0, 4) + name[5] + "&nbsp;&nbsp;" +  + gpa.toFixed(2);
            var clearDiv = document.createElement('div');
            clearDiv.setAttribute("style", "clear:both;");
            graph.appendChild(newBar);
            graph.appendChild(clearDiv);
        }
    }
}
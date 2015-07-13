/**
 * Created by ewind on 15/7/11.
 */
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
function calculate() {
    var COUNT_FAILED = document.getElementById("count-not-passed").innerHTML;
    var SCORE_5_GRADE = document.getElementById("score-5-grade").innerHTML;
    var SCORE_2_GRADE = document.getElementById("score-2-grade").innerHTML;

    var rawLines = document.getElementById("input").value.split("\n");
    if (rawLines.length <= 1) return;
    var arithmeticAvg = NaN, weightAvg = NaN,
        courses = [], gpaResult = {}, semestersRecord = {};

    initCourses();
    gradeTransform();
    washFailedCourses();
    overallGPA();
    semesterGPA();
    arithmeticAverage();
    weightedAverage();
    showResult(courses, arithmeticAvg, weightAvg, gpaResult, semestersRecord);
    function initCourses() {
        for (var i = 0; i < rawLines.length; i++) {
            var rawLine = rawLines[i].replace(/\t/g, ' ').split(' ');
            rawLine.clean("");
            if (rawLine.length == 8 && rawLine[0][0] == '2') {
                var tmpCourse = {
                    'semester': rawLine[0],
                    'name': rawLine[2],
                    'type': rawLine[3],
                    'score': rawLine[4],
                    'serial': rawLine[5],
                    'credit': rawLine[6],
                    'status': rawLine[7]
                };
                // remove courses that is abandoned or special courses
                if (tmpCourse['score'] === '放弃' || tmpCourse['type'] === "") {
                    continue;
                }
                courses.push(tmpCourse);
            }
        }
    }
    function gradeTransform() {
        for (var i = 0; i < courses.length; i++) {
            var course = courses[i];
            // transform score for 5 grades
            if (course['score'].match(/[ABCDF]/) != null) {
                var gradeRange = query5Grade(course['score']);
                switch (SCORE_5_GRADE) {
                    case 'Max':
                        course['score'] = gradeRange['high'];
                        break;
                    case 'Mid':
                        course['score'] = gradeRange['mid'];
                        break;
                    case 'Min':
                        course['score'] = gradeRange['low'];
                }
            }
            // no transform performed
            else if (course['score'].match(/[0-9]+/) != null) {}
            else {
                // transform for 2 grades
                switch (SCORE_2_GRADE) {
                    case '80':
                        course['score'] = 80; break;
                    case '60':
                        course['score'] = 60; break;
                    case 'Ignore':
                        delete courses[i];
                }
            }
        }
        courses.clean(undefined);
    }
    function washFailedCourses() {
        var passedCourse = {};
        // find out all courses already passed
        // including courses passed through resit
        for (var i = 0; i < courses.length; i++) {
            var course = courses[i];
            if (course['score'] >= 60) {
                passedCourse[course['name']] = true;
            }
        }
        for (i = 0; i < courses.length; i++) {
            course = courses[i];
            // to courses taken resit and passed
            // failed record will be removed
            if (
                course['score'] < 60
                && course['name'] in passedCourse
            ) delete courses[i];
            // to courses taken resit but not passed yet
            // resit record (with serial 0) will not involve
            else if (
                course['score'] < 60
                && !(course['name'] in passedCourse)
                && course['serial'] === '0'
            ) delete courses[i];
            // to courses taken resit but not passed yet
            // record or not depends on user
            else if (
                course['score'] < 60
                && !(course['name'] in passedCourse)
                && COUNT_FAILED === 'Not Include'
            ) delete courses[i];
        }
        courses.clean(undefined);
    }
    function weightedAverage() {
        var weightedSum = 0;
        var creditSum = 0;
        for (var i = 0; i < courses.length; i++) {
            var tmpGPA = queryGPA(courses[i]['score'], 'ustc-4.3');
            weightedSum += parseFloat(courses[i]['score']) * parseFloat(courses[i]['credit']);
            creditSum += parseFloat(courses[i]['credit']);
        }
        weightAvg = (weightedSum / creditSum).toFixed(2);
    }
    function arithmeticAverage() {
        var courseSum = 0;
        for (var i = 0; i < courses.length; i++) {
            courseSum += parseFloat(courses[i]['score']);
        }
        arithmeticAvg = (courseSum / courses.length).toFixed(2);
    }
    function overallGPA() {
        var gpaTypes = ['typical-4.0', 'improved-4.0-1', 'improved-4.0-2', 'pku-4.0', 'canada-4.3', 'ustc-4.3', 'sjtu-4.3'];
        for (var i = 0; i < gpaTypes.length; i++) {
            var gpaSum = 0;
            var creditSum = 0;
            for (var j = 0; j < courses.length; j++) {
                var tmpGPA = queryGPA(courses[j]['score'], gpaTypes[i]);
                gpaSum += tmpGPA * parseFloat(courses[j]['credit']);
                creditSum += parseFloat(courses[j]['credit']);
            }
            gpaResult[gpaTypes[i]] = (gpaSum / creditSum).toFixed(2);
        }
    }
    function semesterGPA() {
        for (var i = 0; i < courses.length; i++) {
            var course = courses[i];
            if ( !(course['semester'] in semestersRecord) ) {
                var tmpGPA = queryGPA(course['score'], 'ustc-4.3');
                semestersRecord[course['semester']] = {
                    'gpaSum': tmpGPA * parseFloat(course['credit']),
                    'creditSum': parseFloat(course['credit'])
                }
            } else {
                tmpGPA = queryGPA(course['score'], 'ustc-4.3');
                var currentSemester = semestersRecord[course['semester']];
                currentSemester['gpaSum'] += tmpGPA * parseFloat(course['credit']);
                currentSemester['creditSum'] += parseFloat(course['credit']);
            }
        }
        for (i in semestersRecord) {
            var semester = semestersRecord[i];
            semester['name'] = i;
            semester['gpa'] = semester['gpaSum'] / semester['creditSum'];
        }
    }
    function query5Grade(score) {
        var gradesTable = {
            'A+': {'high': 100, 'mid': 97.5, 'low': 95},
            'A': {'high': 94, 'mid': 92.5, 'low': 90},
            'A-': {'high': 89, 'mid': 87.5, 'low': 85},
            'B+': {'high': 84, 'mid': 83.5, 'low': 82},
            'B': {'high': 81, 'mid': 80, 'low': 78},
            'B-': {'high': 77, 'mid': 76.5, 'low': 75},
            'C+': {'high': 74, 'mid': 73, 'low': 72},
            'C': {'high': 71, 'mid': 69.5, 'low': 68},
            'C-': {'high': 67, 'mid': 66, 'low': 65},
            'D+': {'high': 64, 'mid': 64, 'low': 64},
            'D': {'high': 63, 'mid': 62, 'low': 61},
            'D-': {'high': 60, 'mid': 60, 'low': 60},
            'F': {'high': 0, 'mid': 0, 'low': 0}
        };
        return gradesTable[score];
    }
    function queryGPA(score, alg) {
        var algorithmTable = {
            'typical-4.0': [[90, 4.0], [80, 3.0], [70, 2.0], [60, 1.0], [0, 0]],
            'improved-4.0-1': [[85, 4.0], [70, 3.0], [60, 2.0], [0, 0]],
            'improved-4.0-2': [[85, 4.0], [75, 3.0], [60, 2.0], [0, 0]],
            'pku-4.0': [[90, 4.0], [85, 3.7], [82, 3.3], [78, 3.0], [75, 2.7], [72, 2.3], [68, 2.0], [64, 1.5], [60, 1.0], [0, 0]],
            'canada-4.3': [[90, 4.3], [85, 4.0], [80, 3.7], [75, 3.3], [70, 3.0], [65 , 2.7], [60, 2.3], [0, 0]],
            'ustc-4.3': [[95, 4.3], [90, 4.0], [85, 3.7], [82, 3.3], [78, 3.0], [75, 2.7], [72, 2.3], [68, 2.0], [65, 1.7], [64, 1.5], [61, 1.3], [60, 1.0], [0, 0]],
            'sjtu-4.3': [[95, 4.3], [90, 4.0], [85, 3.7], [80, 3.3], [75, 3.0], [70, 2.7], [67, 2.3], [65, 2.0], [62, 1.7], [60, 1.0], [0, 0]]
        };
        for (var i = 0; i < algorithmTable[alg].length; i++) {
            var lowerBound = algorithmTable[alg][i][0];
            var gpa = algorithmTable[alg][i][1];
            if (score >= lowerBound) return gpa;
        }
    }
}
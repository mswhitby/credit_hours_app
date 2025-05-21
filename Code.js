function doGet() {
    const template = HtmlService.createTemplateFromFile("index");
    return template.evaluate()
        .setTitle("Credit Hours Tracker")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getMapSchemaObject() {
    const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Map");
    const [headers, ...rows] = mappingSheet.getDataRange().getDisplayValues();

    const mappingObj = {};
    for (const row of rows) {
        const rowObj = {};
        headers.forEach((h, idx) => {rowObj[h] = row[idx];});
        const key = rowObj["Column Name"];
        if (key) {mappingObj[key] = rowObj;}
    }

    // Logger.log(mappingObj);
    return mappingObj;
}

function searchByID(id= 68659) {
    const progressSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Progress");
    const [headers, ...studentData] = progressSheet.getDataRange().getDisplayValues();
    Logger.log(headers);

    const userData = studentData.find(row => row[0].toString() === id.toString());
    Logger.log(JSON.stringify(userData));
    if (!userData || userData.length === 0) return null;

    const mappingObj = getMapSchemaObject();
    const studentObj = buildStudentObject(headers, userData, mappingObj);

    Logger.log(`studentObj ${JSON.stringify(studentObj, null, 2)}`)
    Object.entries(studentObj).forEach(([key, value]) => {Logger.log(`${key}: ${value}`);});
    return studentObj;
}

function buildStudentObject(headers, userData, mappingObj) {
    const studentObj = {};
    const attendanceHistory = [];

    const hoursNeededIdx = headers.indexOf("Hrs Needed");
    const hoursGainedIdx = headers.indexOf("Hrs Gained");

    Logger.log(`
    Hrs Needed: ${userData[hoursNeededIdx]}
    Hrs Gained: ${userData[hoursGainedIdx]}
    `)

    headers.forEach((col, idx) => {
        const mapEntry = mappingObj[col];
        const value = userData[idx];

        if (!mapEntry || mapEntry["Active"]?.toString().toLowerCase() !== "true") return;

        const displayName = mapEntry["Display Name"] || col;
        const dataType = mapEntry["Data Type"]?.toLowerCase();
        const isMakeUpDate = mapEntry["Is Date"]?.toString().toLowerCase() === "true";

        // Track all active fields
        if (value !== null && value !== undefined && value !== "") {
            // Logger.log(`
            //   displayName: ${displayName}
            //   dataType: ${dataType}
            //   isMakeUpDate: ${isMakeUpDate}
            // `)

            if (dataType === "duration") {
                const duration = normalizeDuration(value);
                Logger.log(`${displayName}: ${value} || ${duration}`)
                studentObj[displayName] = formatHoursToWords(duration);
                Logger.log(`${displayName}: ${studentObj[displayName]}`)

                // If it's a Make-Up Date, add to attendance history
                if (isMakeUpDate && duration > 0) {
                    attendanceHistory.push({
                        date: displayName,
                        type: "Saturday School",
                        hours: formatHoursToWords(duration),
                        status: "Completed"
                    });
                }
            } else {
                studentObj[displayName] = value;
            }
        }
    });
    studentObj.attendanceHistory = attendanceHistory;
    studentObj["Hours Lost"] = calcHoursLost(userData, hoursNeededIdx, hoursGainedIdx);
    return studentObj;
}

function normalizeDuration(value) {
    if (typeof value !== "string") return 0;
    const match = value.trim().match(/^(-)?(\d+):(\d+)$/);
    if (!match) return 0;
    
    const [, negative, h, m] = match;
    let minutes = parseInt(h, 10) * 60 + parseInt(m, 10);
    if (negative) minutes *= -1;

    const hours = minutes / 60;
    timeStr =  hours.toFixed(3); // returns as string

    // Logger.log(`u
    //   value: ${value}
    //   minutes: ${minutes}
    //   hours: ${hours}
    //   timeStr: ${timeStr}
    // `)
    return timeStr;
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function formatHoursToWords(decimalHours) {
    const isNegative = decimalHours < 0;
    const absHours = Math.abs(decimalHours);

    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours - hours) * 60);

    const hrLabel = hours === 1 ? "hr" : "hrs";
    const minLabel = minutes === 1 ? "min" : "mins";

    let result = "";
    if (hours && minutes) result = `${hours} ${hrLabel}, ${minutes} ${minLabel}`;
    else if (hours) result = `${hours} ${hrLabel}`;
    else if (minutes) result = `${minutes} ${minLabel}`;
    else result = "0";

    return isNegative ? `-${result}` : result;
}

function calcHoursLost(userData, hoursNeededIdx, hoursGainedIdx) {
    const hoursNeeded = normalizeDuration(userData[hoursNeededIdx]);
    const hoursGained = normalizeDuration(userData[hoursGainedIdx]);
    Logger.log(hoursNeeded)
    Logger.log(hoursGained)
    return formatHoursToWords(parseFloat(hoursNeeded) + parseFloat(hoursGained));
}



function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
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

let testStudentID = 10005967
function searchByStudentId(id) {
  const userID = id || testStudentID;
  // Logger.log(userID, userID.toString());

  const progressSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Progress");
  const [headers, ...studentData] = progressSheet.getDataRange().getDisplayValues();
  Logger.log(headers);

  const userData = studentData.find(row => row[0].toString() === userID.toString());
  Logger.log(JSON.stringify(userData));
  if (userData.length === 0) return null;

  const mappingObj = getMapSchemaObject();
  const studentObj = buildStudentObject(headers, userData, mappingObj);

  Object.entries(studentObj).forEach(([key, value]) => {Logger.log(`${key}: ${value}`);});
  return studentObj;
}

function buildStudentObject(headers, userData, mappingObj) {
  const studentObj = {};

  headers.forEach((col, idx) => {
    const mapEntry = mappingObj[col];
    const value = userData[idx];

    if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        mapEntry["Active"]?.toString().toLowerCase() === "true"
    ) {
      const key = mappingObj[col]?.["Display Name"] || col;
      const dataType = mapEntry?.["Data Type"]?.toLowerCase();

      if (dataType === "duration") {
        studentObj[key] = normalizeDuration(value);
      } else {
        studentObj[key] = value;
      }
    };
  });

  return studentObj;
}

function normalizeDuration(value) {
  if (typeof value !== "string") return 0;
  const match = value.trim().match(/(\d+):(\d+)/);
  if (!match) return 0;
  let [_, h, m] = match;
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}


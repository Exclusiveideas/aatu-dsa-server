const xlsx = require("xlsx");
const path = require("path");

const preference_list = [
    // University Female Hostel, Biomedical Engineering
    {
      matric: "125/20/2/0024",
      name: "Adio Hephzibah Opeoluwa",
      hostelName: "University Female Hostel",
      bedSpaceNumber: 99, // assumed
      roomNumber: 25, // assumed
      bunkType: "Bunk A",
      bedPosition: "Lower",
      department: "Biomedical Engineering",
    },
    {
      matric: "125/20/2/0021",
      name: "Adegoke Ayomide Priscilla",
      hostelName: "University Female Hostel",
      bedSpaceNumber: 100, // assumed
      roomNumber: 25, // assumed
      bunkType: "Bunk A",
      bedPosition: "Upper",
      department: "Biomedical Engineering",
    },
    {
      matric: "125/20/2/0020",
      name: "Abdulrasaq Shuqroh Ọpẹ́yẹmí",
      hostelName: "University Female Hostel",
      bedSpaceNumber: 98, // assumed
      roomNumber: 25, // assumed
      bunkType: "Bunk B",
      bedPosition: "Upper",
      department: "Biomedical Engineering",
    },
    {
      matric: "125/20/2/0022",
      name: "Adeniji Adewumi Fumilayo",
      hostelName: "University Female Hostel",
      bedSpaceNumber: 97, // assumed
      roomNumber: 25, // assumed
      bunkType: "Bunk B",
      bedPosition: "Lower",
      department: "Biomedical Engineering",
    },
];

// Define start and end bedspaces for University Male Hostel
const startBedspace = 62;
const endBedspace = 100;
const taken_bedspaces = new Set(preference_list.map((p) => p.bedSpaceNumber));

function deriveBedspace(student) {
  // Check if the student is in the preference list
  const preferredStudent = preference_list.find(
    (pref) => pref?.matric === student["Matric Number"]
  );

  // If the student is in the preference list, return their predefined bedspace
  if (preferredStudent) {
    return {
      bedSpaceNumber: preferredStudent.bedSpaceNumber,
      hostelName: "University Female Hostel",
      roomNumber: preferredStudent.roomNumber,
      bunkType: preferredStudent.bunkType,
      bedPosition: preferredStudent.bedPosition,
    };
  }

  // Allocate bedspaces according to room and bedspace rules
  for (let bedspace = endBedspace; bedspace >= startBedspace; bedspace--) {
    // Check if the bedspace is within the valid range and not already taken
    if (!taken_bedspaces.has(bedspace)) {
      // Calculate the room number based on the bedspace
      const roomNumber = Math.ceil(bedspace / 4);

      // Determine position within the room (1 to 4) based on bedspace
      const positionInRoom = bedspace % 4 || 4;

      // Determine bunk type and bed position based on position within the room
      const bunkType = positionInRoom <= 2 ? "Bunk A" : "Bunk B";
      const bedPosition = bedspace % 2 === 0 ? "Upper" : "Lower";

      // Add bedspace to the taken set immediately after assignment
      taken_bedspaces.add(bedspace);

      // Return the assigned bedspace details
      return {
        bedSpaceNumber: bedspace,
        hostelName: "University Male Hostel",
        roomNumber: roomNumber,
        bunkType: bunkType,
        bedPosition: bedPosition,
      };
    }
  }

  // throw new Error("No available bedspace for 500-level male students.");
  return "No available bedspace";
}

// Function to assign rooms and create the updated Excel file with error handling
async function assignRoomsToStudents(inputFilePath, outputFilePath) {
  try {
    // Load the existing Excel file
    const workbook = xlsx.readFile(inputFilePath);

    // Assuming the first sheet is where the data is stored
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Worksheet ${sheetName} not found in the file.`);
    }

    // Convert the sheet to JSON to process rows easily
    const students = xlsx.utils.sheet_to_json(worksheet);

    const updatedData = students.map((student) => {
      try {
        // Extract bedspace info from deriveBedspace function
        const bedspaceInfo = deriveBedspace(student);

        // Check if deriveBedspace returned valid data
        if (
          !bedspaceInfo ||
          !bedspaceInfo.bedSpaceNumber ||
          !bedspaceInfo.hostelName
        ) {
          throw new Error(
            `Invalid bedspace info for student: ${student.matric}`
          );
        }

        // Add bedspace columns to the student data
        return {
          ...student,
          "Bed Space Number": bedspaceInfo.bedSpaceNumber,
          "Hostel Name": bedspaceInfo.hostelName,
          "Room Number": bedspaceInfo.roomNumber,
          "Bunk Type": bedspaceInfo.bunkType,
          "Bed Position": bedspaceInfo.bedPosition,
        };
      } catch (error) {
        console.error(
          `Error processing student ${student.matric}:`,
          error.message
        );
        return {
          ...student,
          "Bed Space Number": "Error",
          "Hostel Name": "Error",
          "Room Number": "Error",
          "Bunk Type": "Error",
          "Bed Position": "Error",
        };
      }
    });

    // Create a new worksheet with the updated data
    const newWorksheet = xlsx.utils.json_to_sheet(updatedData);

    // Create a new workbook and add the new worksheet
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

    // Write the updated workbook to a new Excel file
    xlsx.writeFile(newWorkbook, outputFilePath);

    console.log(`Updated Excel sheet created: ${outputFilePath}`);
  } catch (error) {
    console.error("Failed to assign rooms to students:", error.message);
  }
}

// Usage Example
const inputFilePath = path.join(__dirname, "./500-level_female_students.xlsx");
const outputFilePath = path.join(__dirname, "500-level_female_allocated.xlsx");
assignRoomsToStudents(inputFilePath, outputFilePath);

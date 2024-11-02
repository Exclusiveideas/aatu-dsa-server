const xlsx = require("xlsx");
const path = require("path");

// Define the arrays for preferences and taken bedspaces
const preference_list = [
    // Cyber Security, 300 level students with specified bunk positions
    {
      matric: "125/22/2/0154",
      name: "Mary Oluwatunise AREMU",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 52, //   
      roomNumber: 13, //   
      bunkType: "Bunk B", //   
      bedPosition: "Upper", //   
    },
    {
      matric: "125/22/2/0155",
      name: "Banjo Boluwatife Rachel",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 51, //   
      roomNumber: 13, //   
      bunkType: "Bunk B", //   
      bedPosition: "Lower", //   
    },
    {
      matric: "125/22/2/0028",
      name: "Alarape Maryam Olamiposi",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 50, //   
      roomNumber: 13, //   
      bunkType: "Bunk A",
      bedPosition: "Upper",
    },
    {
      matric: "125/22/2/0029",
      name: "Ashipa Halal Ayomide",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 49, //   
      roomNumber: 13, //   
      bunkType: "Bunk A",
      bedPosition: "Lower",
    },
  // seyi and co
    
    {
      matric: "125/22/2/0162",
      name: "Oluwaseyi Aduragbemi OLAGOKE",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 56, //   
      roomNumber: 14, //   
      bunkType: "Bunk B", //   
      bedPosition: "Upper", //   
    },
    {
      matric: "125/22/2/0195",
      name: "Ogunsola Moridiyat Atinuke",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 55, //   
      roomNumber: 14, //   
      bunkType: "Bunk B", //   
      bedPosition: "Lower", //   
    },
    {
      matric: "125/22/2/0130",
      name: "Maryam Titilope SULAIMAN-OYAREMI",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 54, //   
      roomNumber: 14, //   
      bunkType: "Bunk A", //   
      bedPosition: "Upper", //   
    },
    {
      matric: "125/22/2/0196",
      name: "Oladipo Oluwafolasuyimi Eniola",
      hostelName: "University Female Hostel", //   
      bedSpaceNumber: 53, //   
      roomNumber: 14, //   
      bunkType: "Bunk A", //   
      bedPosition: "Lower", //   
    }
  ];
  
  

// Initialize taken_bedspaces as a Map with bedspace and hostel information
const taken_bedspaces = new Map(
    preference_list.map((student) => [
      `${student.bedSpaceNumber}-${student.hostelName}`,
      true,
    ])
  );
  
  // Function to check if a specific bedspace in a hostel is available
  function isBedspaceAvailable(bedSpace, hostelName) {
    return !taken_bedspaces.has(`${bedSpace}-${hostelName}`);
  }
  
  // Hostel and bedspace configuration
  const hostelConfig = [
    { name: "University Female Hostel", start: 3, end: 56, exclusions: [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48
      ] },
    { name: "Elsalem Block C", start: 13, end: 64,}, // 63 300-level female students
  ];
  
  // Function to determine room details based on bedspace number
  function getRoomDetails(bedSpace) {
    const bedsPerRoom = 4;
    const roomNumber = Math.ceil(bedSpace / bedsPerRoom); // Calculate room number
  
    // Determine position in the room
    const positionInRoom = (bedSpace - 1) % bedsPerRoom;
    let bunkType, bedPosition;
  
    // Determine bunk type based on position in the room
    bunkType = positionInRoom < 2 ? "Bunk A" : "Bunk B"; // First two bedspaces in Bunk A, last two in Bunk B
  
    // Determine bed position: "Upper" for even bedspaces, "Lower" for odd bedspaces
    bedPosition = bedSpace % 2 === 0 ? "Upper" : "Lower";
  
    return { roomNumber, bunkType, bedPosition };
  }
  
  // Function to find the next available bedspace based on hostel configuration
  function findNextBedspace() {
    for (const hostel of hostelConfig) {
      for (let bedSpace = hostel.start; bedSpace <= hostel.end; bedSpace++) {
        // Skip exclusions and check if the bedspace in this hostel is available
        if (!hostel.exclusions?.includes(bedSpace) && isBedspaceAvailable(bedSpace, hostel.name)) {
          // Mark bedspace as taken
          taken_bedspaces.set(`${bedSpace}-${hostel.name}`, true);
  
          // Get room details (room number, bunk type, bed position)
          const { roomNumber, bunkType, bedPosition } = getRoomDetails(bedSpace);
  
          return {
            bedSpaceNumber: bedSpace,
            hostelName: hostel.name,
            roomNumber: roomNumber,
            bunkType: bunkType,
            bedPosition: bedPosition,
          };
        }
      }
    }
    throw new Error("No available bedspaces found for the remaining students.");
  }






// Derive bedspace for each student
function deriveBedspace(student) {
  // Check if student is in the preference list
  const preferredStudent = preference_list.find((pref) => pref.matric === student["Matric Number"]);

  if (preferredStudent) return {
      bedSpaceNumber: preferredStudent.bedSpaceNumber,
      hostelName: preferredStudent.hostelName,
      roomNumber: preferredStudent.roomNumber,
      bunkType: preferredStudent.bunkType,
      bedPosition: preferredStudent.bedPosition,
    };

  // Otherwise, assign the next available bedspace
  return findNextBedspace();
}



// Function to assign rooms and create the updated Excel file with error handling
async function assignRoomsToStudents(inputFilePath, outputFilePath) {
  try {
    // Load the existing Excel file
    const workbook = xlsx.readFile(inputFilePath);

    // Assuming the first sheet is where the data is stored
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) throw new Error(`Worksheet ${sheetName} not found in the file.`);

    // Convert the sheet to JSON to process rows easily
    const students = xlsx.utils.sheet_to_json(worksheet);

    const updatedData = students.map((student) => {
      try {
        // Extract bedspace info from deriveBedspace function
        const bedspaceInfo = deriveBedspace(student);

        // Check if deriveBedspace returned valid data
        if (!bedspaceInfo || !bedspaceInfo.bedSpaceNumber || !bedspaceInfo.hostelName) {
          throw new Error(`Invalid bedspace info for student: ${student.matric}`);
        }

        // Add bedspace columns to the student data
        return {
          ...student,
          "Bed Space Number": bedspaceInfo.bedSpaceNumber,
          "Hostel Name": bedspaceInfo.hostelName,
          "Room Number": bedspaceInfo.roomNumber,
          "Bunk Type": bedspaceInfo.bunkType,
          "Bed Position": bedspaceInfo.bedPosition,
          // Optionally add additional details like room number, bunk type, etc., if needed
        };
      } catch (error) {
        // console.error(`Error processing student ${student.matric}:`, error.message);
        return {
            ...student,
            "Bed Space Number": "Error",
            "Hostel Name": "Error",
            "Room Number": "Error",
            "Bunk Type": "Error",
            "Bed Position": "Error",
            // Optionally add additional details like room number, bunk type, etc., if needed
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
const inputFilePath = path.join(__dirname, "./300_level_female_students.xlsx");
const outputFilePath = path.join(__dirname, "300_level_female_allocated.xlsx");
assignRoomsToStudents(inputFilePath, outputFilePath);

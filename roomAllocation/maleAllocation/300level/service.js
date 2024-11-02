const xlsx = require("xlsx");
const path = require("path");

// Define the arrays for preferences and taken bedspaces

const preference_list = [  
    // Elsalem Block B, Room 7, Electrical and Computer Engineering
    {
      matric: "125/22/1/0140",
      name: "Ojo Joel Ademola",
      hostelName: "Elsalem Block B",
      bedSpaceNumber: 28,
      roomNumber: 7,
      bunkType: "Bunk B",
      bedPosition: "Upper", // Even, so Upper
    },
    {
      matric: "125/22/1/0142",
      name: "Durotoye Abdullahi",
      hostelName: "Elsalem Block B",
      bedSpaceNumber: 27,
      roomNumber: 7,
      bunkType: "Bunk B",
      bedPosition: "Lower", // Odd, so Lower
    },
    {
      matric: "125/22/1/0135",
      name: "Omotaje Emmanuel Oluwaferanmi",
      hostelName: "Elsalem Block B",
      bedSpaceNumber: 26,
      roomNumber: 7,
      bunkType: "Bunk A",
      bedPosition: "Upper", // Even, so Upper
    },
    {
      matric: "125/22/1/0134",
      name: "Oluwasomo Oloriire Samuel",
      hostelName: "Elsalem Block B",
      bedSpaceNumber: 25,
      roomNumber: 7,
      bunkType: "Bunk A",
      bedPosition: "Lower", // Odd, so Lower
    },


    // Me and the guys Elsalem Block D 11
    {
      matric: "125/23/1/0154",
      name: "Muftaudeen Oluwatosin Jimoh",
      hostelName: "Elsalem Block D",
      bedSpaceNumber: 41,
      roomNumber: 11,
      bunkType: "Bunk A",
      bedPosition: "Lower", // Even, so Upper
    },
    {
      matric: "125/22/1/0178",
      name: "Akolade Olatunde	SALAKO",
      hostelName: "Elsalem Block D",
      bedSpaceNumber: 42,
      roomNumber: 11,
      bunkType: "Bunk A",
      bedPosition: "Upper", // Even, so Upper
    },
    {
      matric: "125/22/1/0153",
      name: "Joseph Eleojo ADEJOH",
      hostelName: "Elsalem Block D",
      bedSpaceNumber: 43,
      roomNumber: 11,
      bunkType: "Bunk B",
      bedPosition: "Lower", // Even, so Upper
    },
    {
      matric: "125/22/1/0168",
      name: "Abdul-Azeez Olamide BALOGUN",
      hostelName: "Elsalem Block D",
      bedSpaceNumber: 44,
      roomNumber: 11,
      bunkType: "Bunk B",
      bedPosition: "Upper", // Even, so Upper
    },
  

  // Aso Hostel, Block D, Flat 5
  {
    matric: "125/23/1/0123",
    name: "Wosa Godspower Amadi",
    hostelName: "Aso Hostel Block F Flat-5",
    bedSpaceNumber: 146,
    roomNumber: 1,
    bunkType: "Bunk A",
    bedPosition: "Upper",
  },
  {
    matric: "125/22/1/0030",
    name: "Victor Femi-Johnson",
    hostelName: "Aso Hostel Block F Flat-5",
    bedSpaceNumber: 145,
    roomNumber: 1,
    bunkType: "Bunk A",
    bedPosition: "Lower",
  },
  {
    matric: "125/22/1/0012",
    name: "Morakinyo Akinola David",
    hostelName: "Aso Hostel Block F Flat-5",
    bedSpaceNumber: 147,
    roomNumber: 1,
    bunkType: "Bunk B",
    bedPosition: "Lower",
  },
  {
    matric: "125/23/1/147",
    name: "Akinde David Oluwatishe",
    hostelName: "Aso Hostel Block F Flat-5",
    bedSpaceNumber: 148,
    roomNumber: 1,
    bunkType: "Bunk B",
    bedPosition: "Upper",
  },
  {
    matric: "125/23/1/153",
    name: "Ogundele Michael",
    hostelName: "Aso Hostel Block F Flat-5",
    bedSpaceNumber: 149,
    roomNumber: 2,
    bunkType: "Bunk A",
    bedPosition: "Lower",
  },
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
    { name: "Elsalem Block B", total: 15, start: 1, end: 15,},
    { name: "Elsalem Block D", total: 64, start: 1, end: 64,},
    { name: "Elsalem Block E", total: 46, start: 1, end: 46,}, // 131 students
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
  const preferredStudent = preference_list.find(
    (pref) => pref.matric == student["Matric Number"]
  );

  if (preferredStudent) {
    return {
      bedSpaceNumber: preferredStudent.bedSpaceNumber,
      hostelName: preferredStudent.hostelName,
      roomNumber: preferredStudent.roomNumber,
      bunkType: preferredStudent.bunkType,
      bedPosition: preferredStudent.bedPosition,
    };
  } else {
    return findNextBedspace();
  }

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
const inputFilePath = path.join(__dirname, "./300-level_male_students.xlsx");
const outputFilePath = path.join(__dirname, "300-level_male_allocated.xlsx");
assignRoomsToStudents(inputFilePath, outputFilePath);

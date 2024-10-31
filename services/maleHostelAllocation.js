import { db } from "../firebase/firebaseConfig";

export async function maleHostelAllocation(studentData, studentId) {
  let allocationResult;

  switch (studentData.level) {
    case "500":
      allocationResult = await allocateRoomFor500Level(studentData, studentId);
      break;
    case "400":
      allocationResult = await allocateRoomFor400Level(studentData, studentId);
      break;
    case "300":
      allocationResult = await allocateRoomFor300Level(studentData, studentId);
      break;
    case "200":
      allocationResult = await allocateRoomFor200Level(studentData, studentId);
      break;
    case "100":
      allocationResult = {
        message: `For 100 level students, meet the DSA for your room in the ASO Hostel.`,
      };
      break;
    default:
      allocationResult = {
        message: `Level undefined, meet the DSA to sort you out.`,
      };
      break;
  }

  return allocationResult;
}




async function allocateRoomFor500Level(studentData, studentId) {
  // Define allowed bedspace ranges as numbers
  const allowedBedspaces = [
    ...Array.from({ length: 44 - 29 + 1 }, (_, i) => i + 29), // 29 to 44
    ...Array.from({ length: 100 - 49 + 1 }, (_, i) => i + 49), // 49 to 100
  ];

  // Retrieve all occupied bedspaces in the allowed range in a single query
  const occupiedBedspacesSnapshot = await db
    .collection("uniMaleHostel")
    .where("bedSpaceNumber", "in", allowedBedspaces)
    .get();

  // Store occupied bedspace numbers in a Set for O(1) lookup
  const occupiedBedspaces = new Set();
  occupiedBedspacesSnapshot.forEach((doc) => {
    const bedSpaceData = doc.data();
    // Ensure bedSpaceNumber is treated as a number
    occupiedBedspaces.add(Number(bedSpaceData.bedSpaceNumber));
  });

  // Find the first unoccupied bedspace
  let availableBedspace = null;
  for (let bedSpaceNumber of allowedBedspaces) {
    if (!occupiedBedspaces.has(bedSpaceNumber)) {
      availableBedspace = bedSpaceNumber;
      break;
    }
  }

  // If no available bedspace was found, return an error message
  if (!availableBedspace) {
    return { message: "No available bedspace for 500-level male students" };
  }

  // Use a Firestore transaction to atomically assign the bedspace and update the student record
  const studentRef = db.collection("student").doc(studentId);
  const bedspaceRef = db
    .collection("uniMaleHostel")
    .doc(availableBedspace.toString());

  await db.runTransaction(async (transaction) => {
    // Assign bedspace to student in 'uniMaleHostel' collection
    transaction.set(bedspaceRef, {
      bedSpaceNumber: availableBedspace, // Ensure bedSpaceNumber is saved as a number
      hostelName: "University Male Hostel",
      occupant: {
        fullName: studentData.fullName,
        level: studentData.level,
        gender: studentData.gender,
        faculty: studentData.faculty,
        programme: studentData.faculty,
      },
    });

    // Update the student's document to add bedspace information
    transaction.update(studentRef, {
      bedspace: {
        bedspaceNumber: availableBedspace, // This is saved as a number in the student's document
        hostelName: "University Male Hostel",
      },
    });
  });

  return {
    message: `Room allocated to student with matric ${studentData.matric} in bedspace ${availableBedspace}`,
  };
}

async function allocateRoomFor400Level(studentData, studentId) {
  // Define bedspace ranges for each hostel
  const uniMaleHostelRange = Array.from({ length: 28 }, (_, i) => i + 1); // 1 to 28
  const elsalemBlockARange = [
    ...Array.from({ length: 16 }, (_, i) => i + 1), // 1 to 16
    ...Array.from({ length: 64 - 21 + 1 }, (_, i) => i + 21), // 21 to 64
  ];
  const elsalemBlockBRange = [
    ...Array.from({ length: 24 - 17 + 1 }, (_, i) => i + 17), // 17 to 24
    ...Array.from({ length: 64 - 29 + 1 }, (_, i) => i + 29), // 29 to 64
  ];

  // Check for available bedspace in each hostel in sequence
  let allocated = await tryAssignBedspace(
    studentData,
    studentId,
    "uniMaleHostel",
    uniMaleHostelRange
  );
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "elsalemBlockA",
      elsalemBlockARange
    );
  }
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "elsalemBlockB",
      elsalemBlockBRange
    );
  }

  // Return message based on allocation result
  if (allocated) {
    return {
      message: `Room allocated to 400-level male student with matric ${studentData.matric}`,
    };
  } else {
    return { message: "No available bedspace for 400-level male students" };
  }
}


async function allocateRoomFor300Level(studentData, studentId) {
  // Define bedspace ranges for each hostel
  // four 300level students have already been fixed in Elsalem Block B
  const elsalemBlockBRange = Array.from({ length: 16 }, (_, i) => i + 16); // 1 to 16
  const elsalemBlockDRange = Array.from({ length: 64 }, (_, i) => i + 1); // 1 to 64
  const elsalemBlockERange = Array.from({ length: 44 }, (_, i) => i + 1); // 1 to 44 - because two 300-level students are in Aso hostel

  // Check for available bedspace in each hostel in sequence
  let allocated = await tryAssignBedspace(
    studentData,
    studentId,
    "elsalemBlockB",
    elsalemBlockBRange
  );
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "elsalemBlockD",
      elsalemBlockDRange
    );
  }
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "elsalemBlockE",
      elsalemBlockERange
    );
  }

  // Return message based on allocation result
  if (allocated) {
    return {
      message: `Room allocated to 300-level male student with matric ${studentData.matric}`,
    };
  } else {
    return { message: "No available bedspace for 300-level male students" };
  }
}

async function allocateRoomFor200Level(studentData, studentId) {
  // Define bedspace ranges for each hostel
  const elsalemBlockERange = Array.from({ length: 20 }, (_, i) => i + 45); // 45 to 64
  const elsalemBlockFRange = Array.from({ length: 64 }, (_, i) => i + 1); // 1 to 64
  const asoHostelBlockFRange = [
    ...Array.from({ length: 12 }, (_, i) => i + 121), // Flat 3: 121 to 132
    ...Array.from({ length: 12 }, (_, i) => i + 133), // Flat 4: 133 to 144
    ...Array.from({ length: 12 }, (_, i) => i + 145).filter(
      (b) => b < 145 || b > 149
    ), // Flat 5: 145 to 156 (excluding 145-149)
    ...Array.from({ length: 12 }, (_, i) => i + 157), // Flat 6: 157 to 168
  ];

  // Check for available bedspace in each hostel in sequence
  let allocated = await tryAssignBedspace(
    studentData,
    studentId,
    "elsalemBlockE",
    elsalemBlockERange
  );
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "elsalemBlockF",
      elsalemBlockFRange
    );
  }
  if (!allocated) {
    allocated = await tryAssignBedspace(
      studentData,
      studentId,
      "asoHostel",
      asoHostelBlockFRange
    );
  }

  // Return message based on allocation result
  if (allocated) {
    return {
      message: `Room allocated to 200-level male student with matric ${studentData.matric}`,
    };
  } else {
    return { message: "No available bedspace for 200-level male students" };
  }
}




function determineHostelName(studentLevel) {
  let hostelName;

  switch (studentLevel) {
    case "200":
      hostelName =
        hostelCollection === "elsalemBlockE"
          ? "Elsalem Block E"
          : hostelCollection === "elsalemBlockF"
          ? "Elsalem Block F"
          : "Aso Hostel Block F";
      break;
    case "300":
      hostelName =
        hostelCollection === "elsalemBlockB"
          ? "Elsalem Block B"
          : hostelCollection === "elsalemBlockD"
          ? "Elsalem Block D"
          : "Elsalem Block E";
      break;
    case "400":
      hostelName =
        hostelCollection === "uniMaleHostel"
          ? "University Male Hostel"
          : hostelCollection === "elsalemBlockA"
          ? "Elsalem Block A"
          : "Elsalem Block B";
      break;
    default:
      break;
  }

  return hostelName
}


// Helper function to assign bedspace in a specified hostel and range
async function tryAssignBedspace(
    studentData,
    studentId,
    hostelCollection,
    bedspaceRange
  ) {
    // Retrieve already-occupied bedspaces for this hostel in one query
    const occupiedBedspacesSnapshot = await db
      .collection(hostelCollection)
      .where("bedSpaceNumber", "in", bedspaceRange)
      .get();
  
    // Track occupied bedspaces in a Set for fast lookup
    const occupiedBedspaces = new Set();
    occupiedBedspacesSnapshot.forEach((doc) => {
      occupiedBedspaces.add(Number(doc.data().bedSpaceNumber));
    });
  
    // Find the first unoccupied bedspace in the specified range
    let availableBedspace = null;
    for (let bedSpaceNumber of bedspaceRange) {
      if (!occupiedBedspaces.has(bedSpaceNumber)) {
        availableBedspace = bedSpaceNumber;
        break;
      }
    }
  
    // If an available bedspace is found, proceed with allocation
    if (availableBedspace !== null) {
      const studentRef = db.collection("student").doc(studentId);
      const bedspaceRef = db
        .collection(hostelCollection)
        .doc(availableBedspace.toString());
  
      // Use a Firestore transaction to allocate the bedspace and update student data
      await db.runTransaction(async (transaction) => {
        // Assign bedspace to student in the specified hostel
        transaction.set(bedspaceRef, {
          bedSpaceNumber: availableBedspace,
          hostelName: determineHostelName(studentData.level),
          occupant: {
            fullName: studentData.fullName,
            level: studentData.level,
            gender: studentData.gender,
            faculty: studentData.faculty,
            programme: studentData.programme,
          },
        });
  
        // Update student's document to add bedspace information
        transaction.update(studentRef, {
          bedspace: {
            bedspaceNumber: availableBedspace,
            hostelName: determineHostelName(studentData.level),
          },
        });
      });
      return true; // Successfully allocated
    }
  
    return false; // No available bedspace in this hostel
  }



















// To be revisited later if bug appears in the above code



// Helper function to assign bedspace in a specified hostel and range
// async function tryAssign300LvlBedspace(
//     studentData,
//     studentId,
//     hostelCollection,
//     bedspaceRange
//   ) {
//     // Retrieve already-occupied bedspaces for this hostel in one query
//     const occupiedBedspacesSnapshot = await db
//       .collection(hostelCollection)
//       .where("bedSpaceNumber", "in", bedspaceRange)
//       .get();
  
//     // Track occupied bedspaces in a Set for fast lookup
//     const occupiedBedspaces = new Set();
//     occupiedBedspacesSnapshot.forEach((doc) => {
//       occupiedBedspaces.add(Number(doc.data().bedSpaceNumber));
//     });
  
//     // Find the first unoccupied bedspace in the specified range
//     let availableBedspace = null;
//     for (let bedSpaceNumber of bedspaceRange) {
//       if (!occupiedBedspaces.has(bedSpaceNumber)) {
//         availableBedspace = bedSpaceNumber;
//         break;
//       }
//     }
  
//     // If an available bedspace is found, proceed with allocation
//     if (availableBedspace !== null) {
//       const studentRef = db.collection("student").doc(studentId);
//       const bedspaceRef = db
//         .collection(hostelCollection)
//         .doc(availableBedspace.toString());
  
//       // Use a Firestore transaction to allocate the bedspace and update student data
//       await db.runTransaction(async (transaction) => {
//         // Assign bedspace to student in the specified hostel
//         transaction.set(bedspaceRef, {
//           bedSpaceNumber: availableBedspace,
//           hostelName:
//             hostelCollection === "elsalemBlockB"
//               ? "Elsalem Block B"
//               : hostelCollection === "elsalemBlockD"
//               ? "Elsalem Block D"
//               : "Elsalem Block E",
//           occupant: {
//             fullName: studentData.fullName,
//             level: studentData.level,
//             gender: studentData.gender,
//             faculty: studentData.faculty,
//             programme: studentData.programme,
//           },
//         });
  
//         // Update student's document to add bedspace information
//         transaction.update(studentRef, {
//           bedspace: {
//             bedspaceNumber: availableBedspace,
//             hostelName:
//               hostelCollection === "elsalemBlockB"
//                 ? "Elsalem Block B"
//                 : hostelCollection === "elsalemBlockD"
//                 ? "Elsalem Block D"
//                 : "Elsalem Block E",
//           },
//         });
//       });
//       return true; // Successfully allocated
//     }
  
//     return false; // No available bedspace in this hostel
//   }
  

// Helper function to assign bedspace in a specified hostel and range
// async function tryAssign200LvlBedspace(
//     studentData,
//     studentId,
//     hostelCollection,
//     bedspaceRange
//   ) {
//     // Retrieve already-occupied bedspaces for this hostel in one query
//     const occupiedBedspacesSnapshot = await db
//       .collection(hostelCollection)
//       .where("bedSpaceNumber", "in", bedspaceRange)
//       .get();
  
//     // Track occupied bedspaces in a Set for fast lookup
//     const occupiedBedspaces = new Set();
//     occupiedBedspacesSnapshot.forEach((doc) => {
//       occupiedBedspaces.add(Number(doc.data().bedSpaceNumber));
//     });
  
//     // Find the first unoccupied bedspace in the specified range
//     let availableBedspace = null;
//     for (let bedSpaceNumber of bedspaceRange) {
//       if (!occupiedBedspaces.has(bedSpaceNumber)) {
//         availableBedspace = bedSpaceNumber;
//         break;
//       }
//     }
  
//     // If an available bedspace is found, proceed with allocation
//     if (availableBedspace !== null) {
//       const studentRef = db.collection("student").doc(studentId);
//       const bedspaceRef = db
//         .collection(hostelCollection)
//         .doc(availableBedspace.toString());
  
//       // Use a Firestore transaction to allocate the bedspace and update student data
//       await db.runTransaction(async (transaction) => {
//         // Assign bedspace to student in the specified hostel
//         transaction.set(bedspaceRef, {
//           bedSpaceNumber: availableBedspace,
//           hostelName:
//             hostelCollection === "elsalemBlockE"
//               ? "Elsalem Block E"
//               : hostelCollection === "elsalemBlockF"
//               ? "Elsalem Block F"
//               : "Aso Hostel Block F",
//           occupant: {
//             fullName: studentData.fullName,
//             level: studentData.level,
//             gender: studentData.gender,
//             faculty: studentData.faculty,
//             programme: studentData.programme,
//           },
//         });
  
//         // Update student's document to add bedspace information
//         transaction.update(studentRef, {
//           bedspace: {
//             bedspaceNumber: availableBedspace,
//             hostelName:
//               hostelCollection === "elsalemBlockE"
//                 ? "Elsalem Block E"
//                 : hostelCollection === "elsalemBlockF"
//                 ? "Elsalem Block F"
//                 : "Aso Hostel Block F",
//           },
//         });
//       });
//       return true; // Successfully allocated
//     }
  
//     return false; // No available bedspace in this hostel
//   }
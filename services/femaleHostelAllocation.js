export async function femaleHostelAllocation(studentData, studentId) {
  let allocationResult;

  switch (studentData.level) {
    case "500":
      allocationResult = await allocateRoomFor500LevelFemale(
        studentData,
        studentId
      );
      break;
    case "400":
      allocationResult = await allocateRoomFor400LevelFemale(
        studentData,
        studentId
      );
      break;
    case "300":
      allocationResult = await allocateRoomFor300LevelFemales(
        studentData,
        studentId
      );
      break;
    case "200":
      allocationResult = await allocateRoomFor200LevelFemales(
        studentData,
        studentId
      );
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

async function allocateRoomFor500LevelFemale(studentData, studentId) {
  // Define the allowed bedspace range for 500-level female students
  const allowedBedspaces = Array.from(
    { length: 100 - 62 + 1 },
    (_, i) => i + 62
  ); // 62 to 100

  // Retrieve all occupied bedspaces in the allowed range in a single query
  const occupiedBedspacesSnapshot = await db
    .collection("uniFemaleHostel")
    .where("bedSpaceNumber", "in", allowedBedspaces)
    .get();

  // Store occupied bedspace numbers in a Set for fast lookup
  const occupiedBedspaces = new Set();
  occupiedBedspacesSnapshot.forEach((doc) => {
    const bedSpaceData = doc.data();
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
    return { message: "No available bedspace for 500-level female students" };
  }

  return allocateBedFunction(
    studentId,
    "uniFemaleHostel",
    availableBedspace,
    studentData,
    "University Female Hostel"
  );
}

async function allocateRoomFor400LevelFemale(studentData, studentId) {
  // Define the allowed bedspace ranges as numbers
  const allowedBedspaces = [
    ...Array.from({ length: 48 - 6 + 1 }, (_, i) => i + 6), // 6 to 48
    ...Array.from({ length: 61 - 57 + 1 }, (_, i) => i + 57), // 57 to 61
  ];

  // Retrieve all occupied bedspaces in the allowed range in a single query
  const occupiedBedspacesSnapshot = await db
    .collection("uniFemaleHostel")
    .where("bedSpaceNumber", "in", allowedBedspaces)
    .get();

  // Store occupied bedspace numbers in a Set for O(1) lookup
  const occupiedBedspaces = new Set();
  occupiedBedspacesSnapshot.forEach((doc) => {
    const bedSpaceData = doc.data();
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
    return { message: "No available bedspace for 400-level female students" };
  }

  return allocateBedFunction(
    studentId,
    "uniFemaleHostel",
    availableBedspace,
    studentData,
    "University Female Hostel"
  );
}

async function allocateRoomFor300LevelFemales(studentData, studentId) {
  // Define allowed bedspace ranges for both hostels
  const uniFemaleHostelBedspaces = [
    ...Array.from({ length: 5 - 3 + 1 }, (_, i) => i + 3), // 3 to 5
    ...Array.from({ length: 56 - 49 + 1 }, (_, i) => i + 49), // 49 to 56
  ];

  const elsalemBlockCBedspaces = [
    ...Array.from({ length: 64 - 11 + 1 }, (_, i) => i + 11), // 11 to 64
  ];

  // First, allocate to 'uniFemaleHostel'
  const occupiedUniFemaleHostelSnapshot = await db
    .collection("uniFemaleHostel")
    .where("bedSpaceNumber", "in", uniFemaleHostelBedspaces)
    .get();

  // Track occupied bedspaces in uniFemaleHostel
  const occupiedUniFemaleHostel = new Set();
  occupiedUniFemaleHostelSnapshot.forEach((doc) => {
    occupiedUniFemaleHostel.add(Number(doc.data().bedSpaceNumber));
  });

  // Find the first available bedspace in uniFemaleHostel
  let availableUniFemaleHostelBedspace = null;
  for (let bedSpaceNumber of uniFemaleHostelBedspaces) {
    if (!occupiedUniFemaleHostel.has(bedSpaceNumber)) {
      availableUniFemaleHostelBedspace = bedSpaceNumber;
      break;
    }
  }

  // If there's an available bedspace in uniFemaleHostel, allocate it
  if (availableUniFemaleHostelBedspace) {
    return allocateBedFunction(
      studentId,
      "uniFemaleHostel",
      availableUniFemaleHostelBedspace,
      studentData,
      "University Female Hostel"
    );
  }

  // If no available bedspace in uniFemaleHostel, move to elsalemBlockC
  const occupiedElsalemBlockCSnapshot = await db
    .collection("elsalemBlockC")
    .where("bedSpaceNumber", "in", elsalemBlockCBedspaces)
    .get();

  // Track occupied bedspaces in elsalemBlockC
  const occupiedElsalemBlockC = new Set();
  occupiedElsalemBlockCSnapshot.forEach((doc) => {
    occupiedElsalemBlockC.add(Number(doc.data().bedSpaceNumber));
  });

  // Find the first available bedspace in elsalemBlockC
  let availableElsalemBlockCBedspace = null;
  for (let bedSpaceNumber of elsalemBlockCBedspaces) {
    if (!occupiedElsalemBlockC.has(bedSpaceNumber)) {
      availableElsalemBlockCBedspace = bedSpaceNumber;
      break;
    }
  }

  // If an available bedspace in elsalemBlockC, allocate it
  if (availableElsalemBlockCBedspace) {
    return allocateBedFunction(
      studentId,
      "elsalemBlockC",
      availableElsalemBlockCBedspace,
      studentData,
      "Elsalem Block C"
    );
  }

  // If no bedspace found in either hostel
  return {
    message: "No available bedspace for 300-level female students",
  };
}

async function allocateRoomFor200LevelFemales(studentData, studentId) {
  // Define allowed bedspace range in "elsalemBlockC"
  const elsalemBlockCBedspaces = Array.from({ length: 10 }, (_, i) => i + 1); // Bedspaces 1 to 10

  // Retrieve all occupied bedspaces in the allowed range
  const occupiedBedspacesSnapshot = await db
    .collection("elsalemBlockC")
    .where("bedSpaceNumber", "in", elsalemBlockCBedspaces)
    .get();

  // Track occupied bedspaces in elsalemBlockC
  const occupiedBedspaces = new Set();
  occupiedBedspacesSnapshot.forEach((doc) => {
    occupiedBedspaces.add(Number(doc.data().bedSpaceNumber));
  });

  // Find the first available bedspace in elsalemBlockC
  let availableBedspace = null;
  for (let bedSpaceNumber of elsalemBlockCBedspaces) {
    if (!occupiedBedspaces.has(bedSpaceNumber)) {
      availableBedspace = bedSpaceNumber;
      break;
    }
  }

  // If an available bedspace is found in elsalemBlockC, assign it
  if (availableBedspace) {
    return allocateBedFunction(
      studentId,
      "elsalemBlockC",
      availableBedspace,
      studentData,
      "Elsalem Block C"
    );
  }

  const studentRef = db.collection("student").doc(studentId);

  // If no bedspace is available, assign "Go to Aso hostel"
  await studentRef.update({
    bedspace: {
      status: "Go to Aso hostel",
    },
  });

  return {
    message: `No available bedspace in Elsalem Block C. Assigned student ${studentId} to "Go to Aso hostel"`,
  };
}

async function allocateBedFunction(
  studentId,
  hostelCollectionName,
  availableBedspace,
  studentData,
  hostelName
) {
  // Use a Firestore transaction to atomically assign the bedspace and update the student record

  const studentRef = db.collection("student").doc(studentId);
  const bedspaceRef = db
    .collection(`${hostelCollectionName}`)
    .doc(availableBedspace.toString());

  await db.runTransaction(async (transaction) => {
    transaction.set(bedspaceRef, {
      bedSpaceNumber: availableBedspace,
      hostelName: hostelName,
      occupant: {
        fullName: studentData.fullName,
        level: studentData.level,
        gender: studentData.gender,
        faculty: studentData.faculty,
        programme: studentData.programme,
      },
    });

    transaction.update(studentRef, {
      bedspace: {
        bedspaceNumber: availableBedspace,
        hostelName: hostelName,
      },
    });
  });

  return {
    message: `Room allocated to student ${studentId} in Elsalem Block C, bedspace ${availableBedspace}`,
  };
}

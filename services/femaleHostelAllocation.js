


export async function femaleHostelAllocation(studentData, studentId) {
    let allocationResult;
  
    switch (studentData.level) {
      case "500":
        // allocationResult = await allocateRoomFor500Level(studentData, studentId);
        break;
      case "400":
        // allocationResult = await allocateRoomFor400Level(studentData, studentId);
        break;
      case "300":
        // allocationResult = await allocateRoomFor300Level(studentData, studentId);
        break;
      case "200":
        // allocationResult = await allocateRoomFor200Level(studentData, studentId);
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

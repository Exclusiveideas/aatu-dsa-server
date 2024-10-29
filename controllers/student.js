import { db } from "../firebase/firebaseConfig.js";

export const updatePassport = async (req, res) => {
  const { matric, downloadUrl } = req.body;

  if (!matric || !downloadUrl)
    return res
      .status(400)
      .json({ message: "Please provide all required info." });

  try {
    const studentRef = db.collection("students").where("matric", "==", matric);
    const snapshot = await studentRef.get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ message: "User with this matric isn't registered." });
    }

    // Assuming only one student will be returned
    const studentDoc = snapshot.docs[0];
    await studentDoc.ref.update({ imageLink: downloadUrl });

    res.status(200).json({ result: "successful" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Something went wrong, Try reloading the page.",
        error,
      });
  }
};


export const submitOyshia = async (req, res) => {
  const { studentMatric, ...oyshiaDetails } = req.body;

  // Check for required fields
  if (!studentMatric || Object.values(oyshiaDetails).some((value) => !value)) {
    return res
      .status(400)
      .json({
        message: "Incomplete User details - provide all required info.",
      });
  }

  try {
    // Fetch the student document using matric
    const studentRef = db
      .collection("students")
      .where("matric", "==", studentMatric);
    const studentSnapshot = await studentRef.get();

    if (studentSnapshot.empty) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentDoc = studentSnapshot.docs[0]; // Get the first matching student document
    const studentData = studentDoc.data();

    // Check if the student has already submitted the OYSHIA form
    if (studentData.OyshiaSubmitted) {
      return res
        .status(400)
        .json({ message: "Student has already submitted the OYSHIA form" });
    }


    // Update the student's Oyshia details and mark as submitted
    await db.collection("students").doc(studentDoc.id).update({
      OyshiaDetails: oyshiaDetails,
      OyshiaSubmitted: true,
    });

    // Check if the student is in 100 level
    if (studentData.level === "100") {
      const counterRef = db.collection("oyshiaCounter").doc("oyshiaCounterDoc"); // Use the specific doc ID for the counter
      const counterDoc = await counterRef.get();

      // Increment the counter
      const newCount = (counterDoc.exists ? counterDoc.data().count : 0) + 1;
      await counterRef.set({ count: newCount });

      // Assign the oyshiaNumber to the student
      await db.collection('students').doc(studentDoc.id).update({ 'OyshiaDetails.oyshiaNumber': newCount });
    }

      // Fetch the updated student document
      const updatedStudentDoc = await db.collection('students').doc(studentDoc.id).get();
      const updatedStudentData = updatedStudentDoc.data();
  
      return res.status(200).json({
        message: "Oyshia details submitted successfully.",
        updatedStudent: updatedStudentData,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const fetchStudent = async (req, res) => {
  const { matric } = req.query;

  if (!matric)
    return res.status(400).json({ message: "Student's matric is required." });

  try {
    const studentRef = db.collection("students").where("matric", "==", matric);
    const snapshot = await studentRef.get();

    if (snapshot.empty)
      return res
        .status(404)
        .json({ message: "User doesn't exist - Try creating an account." });

    const studentData = snapshot.docs[0].data();
    res.status(200).json({ result: studentData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, Try reloading the page." });
  }
};
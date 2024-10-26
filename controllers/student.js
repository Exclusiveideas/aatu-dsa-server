import OyshiaCounter from "../models/oyshiaCounter.js";
import Student from "../models/student.js";

export const updatePassport = async (req, res) => {
  const { matric, downloadUrl } = req.body;

  if (!matric || !downloadUrl)
    return res
      .status(400)
      .json({ message: "Error - provide all required info." });

  try {
    const existingUser = await Student.findOne({ matric: matric });

    if (!existingUser)
      return res
        .status(404)
        .json({ message: "User with this matric isn't registered." });

    console.log("patching up user");

    const result = await Student.updateOne(
      { _id: existingUser?._id },
      { $set: { imageLink: downloadUrl } }
    );

    res.status(200).json({ result: "successful" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Something went wrong, Try reloading the page. ",
        error,
      });
  }
};




export const submitOyshia = async (req, res) => {

  const {
    studentId,
    surname,
    othername,
    sex,
    dob,
    maritalStatus,
    phoneNumber,
    IDMeans,
    IDNumber,
    matricNo,
    emailAddress,
    faculty,
    department,
    stateOfOrigin,
    lga,
    genotype,
    bloodGroup,
    medicalConditions,
    nextOfKinName,
    nextOfKinNumber,
    nextOfKinAddress,
  } = req.body;

  if (
    !studentId ||
    !surname ||
    !othername ||
    !sex ||
    !dob ||
    !maritalStatus ||
    !phoneNumber ||
    !IDMeans ||
    !IDNumber ||
    !matricNo ||
    !emailAddress ||
    !faculty ||
    !department ||
    !stateOfOrigin ||
    !lga ||
    !genotype ||
    !bloodGroup ||
    !medicalConditions ||
    !nextOfKinName ||
    !nextOfKinNumber ||
    !nextOfKinAddress
  )
    return res
      .status(400)
      .json({
        message: "Incomplete User details - provide all required info.",
      });

    const oyshiaDetails = {
        surname,
        othername,
        sex,
        dob,
        maritalStatus,
        phoneNumber,
        IDMeans,
        IDNumber,
        matricNo,
        emailAddress,
        faculty,
        department,
        stateOfOrigin,
        lga,
        genotype,
        bloodGroup,
        medicalConditions,
        nextOfKinName,
        nextOfKinNumber,
        nextOfKinAddress,
    }

  try {
    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.OyshiaSubmitted) return res.status(404).json({ message: "Student has already submitted the OYSHIA form" });


    // Update the student's Oyshia details 
    student.OyshiaDetails = oyshiaDetails;

    // Check if the student is in 100 level
    if (student?.level === "100") {
      // Find the Oyshia counter and increment it, assign the new value to the student
      const counterDoc = await OyshiaCounter.findOneAndUpdate(
        {}, // Find the single document
        { $inc: { count: 1 } }, // Increment the counter
        { new: true, upsert: true } // Return the updated document and create if not exists
      );

 
      // Assign Oyshia number to the student
      student.OyshiaDetails.set("oyshiaNumber", counterDoc.count);
      student.OyshiaSubmitted = true;
      const updatedStudent = await student.save();


      return res.status(200).json({
        message: "Oyshia details submitted and Oyshia number has been assigned.",
        updatedStudent,
      });
    } else {
      // For students not in 100 level, just save their Oyshia details without assigning a number
      student.OyshiaSubmitted = true;
      const updatedStudent = await student.save();

      return res.status(200).json({
        message: "Oyshia details submitted, but no Oyshia number assigned.",
        updatedStudent
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const fetchStudent = async (req, res) => {
  const { matric } = req.query;
  
  if(!matric) return res.status(400).json({ message: "Student's matric is required." });

  try {
      const existingStudent = await Student.findOne({ matric: matric });

      if(!existingStudent) return res.status(404).json({ message: "User doesn't exists - Try creating an account." });

      res.status(200).json({ result: existingStudent })

  } catch (error) {
      res.status(500).json({ message: "Something went wrong, Try reloading the pages." })
  }
}
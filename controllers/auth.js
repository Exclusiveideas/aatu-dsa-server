import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/student.js';
import { matchUserDetails } from '../utils/authFunctions.js';

export const loginUser = async (req, res) => {
    const { matric, password } = req.body;

    try {
        const existingStudent = await Student.findOne({ matric: matric });

        if(!existingStudent) return res.status(404).json({ message: "User doesn't exists - Try creating an account." });

        const isPasswordCorrect = await bcrypt.compare(password, existingStudent.password);
        if(!isPasswordCorrect) return res.status(400).json({ message: "Wrong password."});

        // console.log('logging in user')

        const token = jwt.sign({ matric: existingStudent.matric, id: existingStudent._id}, 'test', { expiresIn: "1h" });

        res.status(200).json({ result: existingStudent, token})

    } catch (error) {
        res.status(500).json({ message: "Something went wrong, Try reloading the pages." })
    }
}



export const registerUser = async (req, res) => {
    const { fullName, email, matric, faculty, programme, imageLink, level, gender, password } = req.body;

    if (!fullName || !email || !matric || !faculty || !programme || !imageLink || !level || !gender || !password) {
        return res.status(400).json({ message: "Incomplete User details - provide all required info." });
    }

    try {
        // Check if matric or email already exists
        const existingMatricUser = await Student.findOne({ matric });
        const existingEmailUser = await Student.findOne({ email });

        if (existingMatricUser) {
            return res.status(400).json({ message: "Matric already registered - Try logging in." });
        }
        if (existingEmailUser) {
            return res.status(400).json({ message: "Email already registered - Try logging in." });
        }

        const hashedPassword = await bcrypt.hash(password, 16);

        const newStudent = new Student({
            fullName,
            matric,
            email,
            faculty,
            programme,
            imageLink,
            level,
            gender,
            password: hashedPassword,
            bedSpace: null,
            OyshiaSubmitted: false,
            OyshiaDetails: {},
        });

        const result = await newStudent.save();
        
        const token = jwt.sign({ matric: result.matric, id: result._id }, 'test', { expiresIn: "1h" });

        res.status(200).json({ result, token });

    } catch (error) {
        // Check if the error is due to unique index constraint violation
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            const message = duplicateField === "email"
                ? "Email already registered - Try logging in."
                : "Matric already registered - Try logging in.";
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: "Something went wrong, Try reloading the page.", error });
    }
};




export const resetPassword = async (req, res) => {
    const { fullName, matric, email, faculty, programme, newPassword } = req.body;

    if(!fullName || !matric || !email || !faculty || !programme || !newPassword) return  res.status(400).json({ message: "Incomplete reset password details - provide all required info." });


    
    try {
        
        const existingUser = await Student.findOne({ matric: matric });

        if(!existingUser) return res.status(404).json({ message: "User with this matric isn't registered." });

        const { matched, message} = matchUserDetails(existingUser, { fullName, email, faculty, programme })

        if(!matched) return res.status(400).json({ message});

        // console.log('patching up user');
        
        const newHashedPassword = await bcrypt.hash(newPassword, 16);

        const result = await Student.updateOne({ _id: existingUser?._id}, {$set: { password: newHashedPassword } })
 
        res.status(200).json({ result: 'successful'});
        
    } catch (error) {
        res.status(500).json({ message: "Something went wrong, Try reloading the page. ", error })
    }
} 
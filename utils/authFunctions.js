

export const matchUserDetails = (existingUser, userDetails) => {
    
    if(existingUser?.fullName != userDetails?.fullName) {
        return {
            matched: false,
            message: "User with matric doesn't match the fullName"
        }
    }

    if(existingUser?.email != userDetails?.email) {
        return {
            matched: false,
            message: "User with matric doesn't match the email"
        }
    }
    

    if(existingUser?.faculty != userDetails?.faculty) {
        return {
            matched: false,
            message: "User with matric doesn't match the faculty"
        }
    }

    if(existingUser?.programme != userDetails?.programme) {
        return {
            matched: false,
            message: "User with matric doesn't match the programme"
        }
    }

    return {
        matched: true,
        message: "Passed all checks"
    }
}
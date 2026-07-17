import API from "./api";


const getAllCourses = async () => {

    try {

        const response = await API.get("/courses");

        return response.data;

    } catch(error) {

        console.log(
            "Error while fetching courses:",
            error
        );

        throw error;

    }

};


const getCourseById = async (id) => {

    try {

        const response = await API.get(`/courses/${id}`);

        return response.data;

    } catch(error) {

        console.log(
            "Error while fetching course:",
            error
        );

        throw error;

    }

};



export default {

    getAllCourses,

    getCourseById

};
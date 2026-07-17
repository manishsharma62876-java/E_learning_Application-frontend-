import API from "./api";


const enrollCourse = async(courseId)=>{


    const token = localStorage.getItem("token");


    const response = await API.post(

        "/enrollments/add",

        {
            courseId: courseId
        },

        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }

    );


    return response.data;


};



const getMyCourses = async()=>{


    const token = localStorage.getItem("token");


    const response = await API.get(

        "/enrollments/my-courses",

        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }

    );


    return response.data;


};



export default {

    enrollCourse,

    getMyCourses

};
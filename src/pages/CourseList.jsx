import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CourseService from "../services/CourseService";

import "./CourseList.css";


function CourseList(){


    const [courses,setCourses] = useState([]);

    const [loading,setLoading] = useState(true);

    const [error,setError] = useState("");

    const navigate = useNavigate();



    useEffect(()=>{

        loadCourses();

    },[]);



    const loadCourses = async()=>{


        try{


            const data = await CourseService.getAllCourses();


            setCourses(data);


            setLoading(false);


        }
        catch(error){


            setError(
                "Unable to load courses"
            );


            setLoading(false);

        }


    };



    if(loading){

        return (

            <h2 className="loading">

                Loading Courses...

            </h2>

        );

    }



    if(error){

        return (

            <h2 className="error">

                {error}

            </h2>

        );

    }



    return(

        <div className="course-page">


            <h1>
                Available Courses
            </h1>



            <div className="course-container">


            {
                courses.map((course)=>(


                    <div 
                        className="course-card"
                        key={course.id}
                    >


                        <h2>
                            {course.title}
                        </h2>



                        <p>
                            {course.description}
                        </p>



                        <div className="course-info">

                            <span>
                                Category:
                                {" "}
                                {course.category}
                            </span>


                            <span>
                                Duration:
                                {" "}
                                {course.duration}
                            </span>


                            <span>
                                Fees:
                                {" "}
                                ₹{course.fees}
                            </span>


                        </div>



                        <button

                            onClick={()=>navigate(`/courses/${course.id}`)}

                        >

                            View Details

                        </button>



                    </div>


                ))

            }


            </div>



        </div>


    );

}


export default CourseList;
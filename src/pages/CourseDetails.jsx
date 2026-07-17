import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CourseService from "../services/CourseService";
import EnrollmentService from "../services/EnrollmentService";

import "./CourseDetails.css";


function CourseDetails(){


    const {id}=useParams();


    const [course,setCourse]=useState(null);

    const [loading,setLoading]=useState(true);

    const [message,setMessage]=useState("");



    useEffect(()=>{

        fetchCourse();

    },[]);



    const fetchCourse=async()=>{


        try{


            const data=
            await CourseService.getCourseById(id);


            setCourse(data);


            setLoading(false);


        }
        catch(error){

            console.log(error);

            setLoading(false);

        }


    };



    const handleEnroll=async()=>{


        try{


            const response =
            await EnrollmentService.enrollCourse(id);



            setMessage(
                "Course enrolled successfully!"
            );


            console.log(response);


        }
        catch(error){


            console.log(error);


            setMessage(
                "Enrollment failed. Please login as Student."
            );


        }


    };



    if(loading){

        return <h2>Loading...</h2>;

    }



    return(

        <div className="course-details-container">


            <div className="course-details-card">


                <h1>
                    {course.title}
                </h1>


                <p className="description">

                    {course.description}

                </p>


                <div className="details">


                    <div>
                        <strong>
                        Category:
                        </strong>

                        <span>
                        {course.category}
                        </span>
                    </div>



                    <div>
                        <strong>
                        Duration:
                        </strong>

                        <span>
                        {course.duration}
                        </span>
                    </div>



                    <div>
                        <strong>
                        Fees:
                        </strong>

                        <span>
                        ₹{course.fees}
                        </span>
                    </div>


                </div>



                <button

                className="enroll-btn"

                onClick={handleEnroll}

                >

                Enroll Now

                </button>



                {
                    message &&

                    <p className="message">

                        {message}

                    </p>

                }


            </div>


        </div>


    );

}


export default CourseDetails;
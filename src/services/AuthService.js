import API from "./api";


const login = async(loginData)=>{


    const response = await API.post(
        "/auth/login",
        loginData
    );


    if(response.data.token){


        localStorage.setItem(
            "token",
            response.data.token
        );


    }


    return response.data;


};



const logout = ()=>{


    localStorage.removeItem("token");

    localStorage.removeItem("role");


};



const getToken = ()=>{


    return localStorage.getItem("token");

};



export default {

    login,

    logout,

    getToken

};
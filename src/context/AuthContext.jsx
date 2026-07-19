import React, { 
createContext, 
useState, 
useEffect 
} from "react";


export const AuthContext=createContext();



export const AuthProvider=({children})=>{


const [user,setUser]=useState(null);

const [loading,setLoading]=useState(true);



useEffect(()=>{


const token=localStorage.getItem("token");
const role=localStorage.getItem("role");
const name=localStorage.getItem("userName");
const email=localStorage.getItem("email");


if(token && role){

setUser({

token,
role,
name,
email

});

}


setLoading(false);


},[]);




const login=(userData)=>{


const {
token,
role,
name,
email
}=userData;



localStorage.setItem(
"token",
token
);


localStorage.setItem(
"role",
role
);


localStorage.setItem(
"userName",
name
);


localStorage.setItem(
"email",
email
);



setUser({

token,
role,
name,
email

});


};





const logout=()=>{


localStorage.clear();

sessionStorage.clear();

setUser(null);


};




return (

<AuthContext.Provider
value={{
user,
loading,
login,
logout
}}
>

{children}

</AuthContext.Provider>

);


};
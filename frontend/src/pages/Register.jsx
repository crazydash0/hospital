import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Register(){

    const [email,setEmail] = useState("")
    const [password , setPassword] =useState("")
    const [fullName, setFullName] = useState("");
    const navigate = useNavigate();

    async function handleRegister (e){
     e.preventDefault();  
try {const response = await api.post("/auth/register", { email, password ,fullName });

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
    }
    return(
        <form onSubmit={handleRegister}>
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) =>setEmail(e.target.value)}
/>
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword (e.target.value)}
/>
<input
  type="text"
  placeholder="Full Name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
/>

<button type="submit">register</button>
</form>

    );
}
export default Register
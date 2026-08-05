import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login(){
    const [email,setEmail] = useState("")
    const [password , setPassword] =useState("")
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

async function handleSubmit(e) {
    e.preventDefault();   
    try {const response = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", response.data.access_token);
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

return(
<form onSubmit={handleSubmit}>
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
<button type="submit">Login</button>
</form>
);
}
export default Login;
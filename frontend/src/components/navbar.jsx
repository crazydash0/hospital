import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
function Navbar(){

const{user , setUser} = useContext(AuthContext);

function handleLogout(){
localStorage.removeItem("token")
setUser(null) ;
}
return(
    <nav>
      {user ? (
        <>
          <h1>Hello, {user.fullName||user.email}</h1>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
)
}
export default Navbar
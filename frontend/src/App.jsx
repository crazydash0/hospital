import { BrowserRouter , Route , Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/navbar";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import BookAppointment from "./pages/BookAppointment";
import CreateSlots from "./pages/CreateSlots";
import WeeklySchedule from "./pages/WeeklySchedule";

function App(){
  return(
  <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/book" element={<ProtectedRoute><BookAppointment/></ProtectedRoute>}/>
      <Route path="/" element={<ProtectedRoute><Home/> </ProtectedRoute>} />
      <Route path = "/register" element = {<Register/>}/>
      <Route path="/login" element={<Login/>} />
      <Route path="/create-slots"element={<ProtectedRoute allowedRoles={["DOCTOR"]}><CreateSlots /></ProtectedRoute>}/>
      <Route path="/weekly-schedule"element={<ProtectedRoute allowedRoles={["DOCTOR"]}><WeeklySchedule /></ProtectedRoute>}/>
    </Routes>
  </BrowserRouter>
);
}
export default App ;
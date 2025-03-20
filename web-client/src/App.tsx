import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GroupManagement from "@/pages/group/GroupManagement";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/groups" element={<GroupManagement/>}/>
      </Routes>
    </Router>
  );
};

export default App;


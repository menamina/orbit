import { Nav } from "./components/nav";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Nav></Nav>
      <Outlet></Outlet>
    </>
  );
}

export default App;

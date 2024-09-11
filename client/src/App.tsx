import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import SignInPage from "./pages/sign-in/SignInPage";
import SignUpPage from "./pages/sign-up/SignUpPage";

function App() {
  return (
    <div className="App">
      <h1>This is App</h1>
      <Routes>
        <Route path="/order-management-app-02" element={<Home />} />
        <Route path="/order-management-app-02/sign-in" element={<SignInPage />} />
        <Route path="/order-management-app-02/sign-up" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}

export default App;

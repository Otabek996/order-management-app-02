import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/home/HomePage";
import SignInPage from "./pages/sign-in/SignInPage";
import SignUpPage from "./pages/sign-up/SignUpPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/order-management-app-02" element={<HomePage />} />
        <Route path="/order-management-app-02/sign-in" element={<SignInPage />} />
        <Route path="/order-management-app-02/sign-up" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}

export default App;

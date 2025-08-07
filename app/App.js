import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./page";
import Home from "./Home/page";
function App() {
  // return <LoginPage />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route index element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
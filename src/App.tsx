import "./App.css";
import EditorPage from "./pages/EditorPage/EditorPage";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route path="/doc" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

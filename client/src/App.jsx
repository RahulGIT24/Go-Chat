import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Space from "./pages/Space";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Space />} path="/room/:roomId/:name" />
      </Routes>
    </Router>
  );
}

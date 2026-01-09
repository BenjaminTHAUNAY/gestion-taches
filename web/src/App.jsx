import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes privées */}
      <Route
        path="/lists"
        element={
          <PrivateRoute>
            <Lists />
          </PrivateRoute>
        }
      />
      <Route
        path="/lists/:id"
        element={
          <PrivateRoute>
            <ListDetail />
          </PrivateRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/lists" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;

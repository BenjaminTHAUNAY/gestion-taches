import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";

// Vérifie si l'utilisateur est connecté
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [selectedList, setSelectedList] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          path="/lists"
          element={
            <PrivateRoute>
              {selectedList ? (
                <ListDetail
                  list={selectedList}
                  onBack={() => setSelectedList(null)}
                />
              ) : (
                <Lists onSelect={(list) => setSelectedList(list)} />
              )}
            </PrivateRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/lists" />} />
      </Routes>
    </Router>
  );
}

export default App;

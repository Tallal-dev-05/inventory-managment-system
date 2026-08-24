import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Admin from "./components/Admin";
import Items from "./components/item";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./components/Products";
import Purchases from "./components/Purchases";
import Sales from "./components/Sales";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC PAGES ================= */}

        <Route path="/signup" element={<SignUp />} />

        <Route path="/signin" element={<SignIn />} />

        <Route path="/" element={<SignIn />} />


        {/* ================= ADMIN PAGE ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <Admin />
              
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
         <ProtectedRoute allowedRole="admin">
         <Products />
         </ProtectedRoute>
  }
/>
<Route
  path="/purchases"
  element={
    <ProtectedRoute allowedRole="admin">
      <Purchases />
    </ProtectedRoute>
  }
/>

<Route
  path="/sales"
  element={
    <ProtectedRoute allowedRole="admin">
      <Sales />
    </ProtectedRoute>
  }
/>


        {/* ================= USER PAGE ================= */}

        <Route
          path="/items"
          element={
            <ProtectedRoute allowedRole="user">
              <Items />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<SignIn />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

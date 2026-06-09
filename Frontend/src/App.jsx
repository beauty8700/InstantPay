import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import Home from "./pages/Home.jsx";
import Send from "./pages/Send.jsx";
import SendMoney from "./pages/SendMoney.jsx";
import AddMoney from "./pages/AddMoney.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";
import AppLayout from "./components/AppLayout.jsx";
import { isLoggedIn } from "./api.js";

function ProtectedLayout() {
  if (!isLoggedIn()) return <Navigate to="/signin" replace />;
  return <AppLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/sendmoney" element={<SendMoney />} />
          <Route path="/addmoney" element={<AddMoney />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

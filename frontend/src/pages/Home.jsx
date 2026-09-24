import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import "./Home.css";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="home-page">
      <Card className="home-card">
        <p className="home-message">You are already logged in.</p>
        <p>
          Role: <strong>{user?.role}</strong>
        </p>

        {user?.role === "admin" ? (
          <Button onClick={() => navigate("/admin/dashboard")}>
            Go to Admin Dashboard
          </Button>
        ) : (
          <Button onClick={() => navigate("/menu")}>Go to Menu</Button>
        )}

        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}

export default Home;
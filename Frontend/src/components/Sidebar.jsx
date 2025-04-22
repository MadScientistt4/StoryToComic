import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column bg-light vh-100 border-end" style={{ width: 260 }}>
      <div className="p-4 fw-bold fs-4 border-bottom">Pictora</div>
      <nav className="flex-grow-1 px-3">
        <ul className="list-unstyled mb-4"> 
          <li>
            <button
              className="btn w-100 text-start mb-2 btn-outline-secondary"
              onClick={() => navigate("/")} // Navigate to homepage
            >
              All Content
            </button>
          </li>
          <li>
            <button
              className="btn w-100 text-start mb-2 btn-outline-secondary"
              onClick={() => navigate("/comics")} // Navigate to homepage
            >
              Comics
            </button>
          </li>
          <li>
            <button
              className="btn w-100 text-start mb-2 btn-outline-secondary"
              onClick={() => navigate("/visuals")} // Navigate to visuals page
            >
              Visuals
            </button>
          </li>
          <li>
            <button
              className="btn w-100 text-start mb-2 btn-outline-secondary"
              onClick={() => navigate("/storylines")} // Navigate to storylines page
            >
              Storylines
            </button>
          </li>
        </ul>
        
          
        
      </nav>
      <Button variant="outline-danger" onClick={handleLogout} className="mt-3 w-90">
        Logout
      </Button>
    </div>
  );
};


// src/components/Sidebar.js

import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Flashcard App</h2>
      <nav>
        <ul>
          <li>
            <NavLink to={"/collections"}>Collections</NavLink>
          </li>

          <li>
            <NavLink to={"/training"}>Training</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

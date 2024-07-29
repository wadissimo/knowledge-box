// src/components/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Flashcard App</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/collections" className={(navData) => (navData.isActive ? "active-style" : 'none')}>
              My Collections
            </NavLink>
          </li>
          <li>
            <NavLink to="/cards" className={(navData) => (navData.isActive ? "active-style" : 'none')}>
              Manage Cards
            </NavLink>
          </li>
          <li>
            <NavLink to="/training" className={(navData) => (navData.isActive ? "active-style" : 'none')}>
              Training
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

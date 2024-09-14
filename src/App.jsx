// src/App.js

import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TrainingOverview from "./components/TrainingOverview";
import Training from "./components/Training";
import CollectionsPage from "./components/CollectionsPage";
import ManageCollectionCards from "./components/ManageCollectionCards";
import Card from "./data/Card";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, purple, blue, orange } from "@mui/material/colors";
import { v4 as uuidv4 } from "uuid";

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: orange[900],
    },
  },
});

import "./App.css";

const App = () => {
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Collection 1",
      cards: [
        new Card(uuidv4(), "Card 1 Front", "Card 1 Back🤦‍♀️"),
        new Card(uuidv4(), "Card 2 Front", "Card 2 Back"),
      ],
    },
    {
      id: 2,
      name: "Collection 2",
      cards: [
        new Card(uuidv4(), "Card 3 Front", "Card 3 Back"),
        new Card(uuidv4(), "Card 4 Front", "Card 4 Back"),
      ],
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route
                path="/"
                element={
                  <CollectionsPage
                    collections={collections}
                    setCollections={setCollections}
                  />
                }
              />

              <Route
                path="/collections"
                element={
                  <CollectionsPage
                    collections={collections}
                    setCollections={setCollections}
                  />
                }
              />
              <Route
                path="/collection/:id"
                element={
                  <ManageCollectionCards
                    collections={collections}
                    setCollections={setCollections}
                  />
                }
              />
              <Route
                path="/training"
                element={<TrainingOverview collections={collections} />}
              />
              <Route
                path="/training/:collectionId"
                element={<Training collections={collections} />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;

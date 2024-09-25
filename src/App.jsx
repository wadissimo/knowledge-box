// src/App.js

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Sidebar from "./features/ui/Sidebar";
import TrainingOverview from "./features/training/TrainingOverview";
import Training from "./features/training/Training";
import CollectionsPage from "./features/collections/CollectionsPage";
import ManageCollectionsPage, {
  collectionLoader,
} from "./features/collections/ManageCollectionsPage";
import Card from "./data/Card";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, purple, blue, orange } from "@mui/material/colors";
import { v4 as uuidv4 } from "uuid";

import "./App.css";
import { CollectionProvider } from "./context/CollectionContext";
import AppLayout from "./AppLayout";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <CollectionsPage />,
      },
      {
        path: "/collections",
        element: <CollectionsPage />,
      },
      {
        path: "/cards/:id",
        element: <ManageCollectionsPage />,
        loader: collectionLoader,
      },
      {
        path: "/training",
        element: <TrainingOverview />,
      },
      {
        path: "/training/:collectionId",
        element: <Training />,
      },
    ],
  },
]);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CollectionProvider>
        <RouterProvider router={router}></RouterProvider>
      </CollectionProvider>
    </ThemeProvider>
  );
};

export default App;

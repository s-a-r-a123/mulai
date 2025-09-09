import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Login from "./login";

import "leaflet/dist/leaflet.css";
import "./index.css"; // your global map/app styles

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <App onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

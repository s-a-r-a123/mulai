import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import jsPDF from "jspdf";
import "leaflet/dist/leaflet.css";

// Fix marker icons for Vite bundling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to move map when coordinates are searched
function MapMover({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView(coords, 10); // Adjust zoom level as per requirements
    }
  }, [coords, map]);

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [decision, setDecision] = useState(null);
  const [position, setPosition] = useState(null);
  const [purpose, setPurpose] = useState("Commercial");
  const [claimed, setClaimed] = useState(false);
  const [appealed, setAppealed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [coords, setCoords] = useState(null);
  const markerRef = useRef(null);

  // Simulate backend decision
  function analyzeClaim(lat, lon, purpose) {
    let decision = "Claim Rejected";
    let reason = "Land is protected area";

    if (purpose === "Commercial" && lat > 15 && lon > 75) {
      decision = "Claim Approved";
      reason = "Land suitable for commercial use";
    } else if (purpose === "Industrial") {
      decision = "Further Review Required";
      reason = "Environmental clearance needed";
    }

    return { decision, reason, lat, lon, purpose };
  }

  function handleMapClick(e) {
    setPosition(e.latlng);
    setDecision(null);
    setClaimed(false);
    setAppealed(false);
  }

  function handleClaim() {
    if (!position) return alert("Select a location on map first!");
    const result = analyzeClaim(position.lat, position.lng, purpose);
    setDecision(result);
    setClaimed(true);
    setActiveTab("decision");
  }

  function handleAppeal() {
    setAppealed(true);
    setActiveTab("appeal");
  }

  function downloadReport() {
    const doc = new jsPDF();
    doc.text("Mullai Decision Report", 20, 20);
    if (decision) {
      doc.text(`Decision: ${decision.decision}`, 20, 40);
      doc.text(`Reason: ${decision.reason}`, 20, 50);
      doc.text(`Purpose: ${decision.purpose}`, 20, 60);
      doc.text(`Coordinates: ${decision.lat}, ${decision.lon}`, 20, 70);
    } else {
      doc.text("No decision available", 20, 40);
    }
    doc.save("mullai_report.pdf");
  }

  async function handleSearch(e) {
    e.preventDefault();

    const parts = searchInput.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoords([lat, lon]);
        setPosition({ lat, lng: lon });
        return;
      }
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords([lat, lon]);
        setPosition({ lat, lng: lon });
      } else {
        alert("Place not found");
      }
    } catch (err) {
      alert("Error fetching location");
    }
  }

  return (
    <div style={{ height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navbar */}
      <div
        style={{
          background: "#29824eff",
          color: "white",
          padding: "12px 30px",
          height: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo (Pacifico font) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logom.png" // Logo path (ensure it's in the public folder)
            alt="Mullai Logo"
            style={{ width: "80px", height: "80px" }}
          />
          <h2
            style={{
              fontFamily: "'Story Script', cursive",
              fontSize: "58px",
              fontWeight: "bold",
              color: "#ffffff",
              textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
              margin: 0,
            }}
          >
            Mullai
          </h2>
        </div>
        {/* Navbar Links (Dosis font) */}
        <div
          style={{
            fontFamily: "'Dosis', sans-serif",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          <span
            style={{ margin: "0 15px", cursor: "pointer" }}
            onClick={() => setActiveTab("map")}
          >
            🗺️ Map
          </span>
          <span
            style={{ margin: "0 15px", cursor: "pointer" }}
            onClick={() => setActiveTab("about")}
          >
            ℹ️ About
          </span>
          <span
            style={{ margin: "0 15px", cursor: "pointer" }}
            onClick={() => setActiveTab("decision")}
          >
            📄 Decision
          </span>
          <span
            style={{ margin: "0 15px", cursor: "pointer" }}
            onClick={() => setActiveTab("appeal")}
          >
            ⚖️ Appeal
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ height: "calc(100% - 60px)" }}>
        {activeTab === "map" && (
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "70%", height: "100%" }}>
              <MapContainer
                center={[20, 80]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  map.on("click", handleMapClick);
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker ref={markerRef} position={position}></Marker>}
                <MapMover coords={coords} />
              </MapContainer>
            </div>

            <div style={{ padding: 20, width: "30%", background: "#f9f9f9" }}>
              <h2>Land Claim</h2>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter coordinates (lat, lon) or place name"
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px",
                    background: "#2f8252ff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  🔍 Search
                </button>
              </form>

              <label>
                <b>Purpose of Land:</b>
              </label>
              <br />
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{ width: "100%", padding: "8px", margin: "10px 0" }}
              >
                <option>Commercial</option>
                <option>Protected</option>
                <option>Industrial</option>
                <option>Agricultural</option>
              </select>

              <button
                onClick={handleClaim}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: "#29824eff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Claim Now
              </button>
            </div>
          </div>
        )}

        {activeTab === "decision" && (
          <div style={{ padding: 30, fontFamily: "'Crimson Text', serif", fontSize: "20px" }}>
            <h2 style={{ color: "#1a237e" }}>📄 Decision</h2>
            {claimed && decision ? (
              <div>
                <p>
                  <b>Decision:</b> {decision.decision}
                </p>
                <p>
                  <b>Reason:</b> {decision.reason}
                </p>
                <p>
                  <b>Purpose:</b> {decision.purpose}
                </p>
                <p>
                  <b>Coordinates:</b> {decision.lat}, {decision.lon}
                </p>

                {/* Buttons below the decision */}
                <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
                  {/* Download Report Button */}
                  <button
                    onClick={downloadReport}
                    style={{
                      padding: "10px",
                      background: "#2f8252ff",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      height: 60,
                      width: "100%", // Ensure the width is consistent with Appeal Claim
                      maxWidth: "200px", // Set max width to keep it similar size
                    }}
                  >
                    📄 Download Report PDF
                  </button>

                  {/* Appeal Claim Button */}
                  <button
                    onClick={handleAppeal}
                    style={{
                      padding: "10px",
                      background: "#29824eff",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      height: 50,
                      width: "100%", // Ensure the width is consistent with Download Report
                      maxWidth: "200px", // Set max width to keep it similar size
                    }}
                  >
                    ⚖️ Appeal Claim
                  </button>
                </div>
              </div>
            ) : (
              <p>No claim submitted yet.</p>
            )}
          </div>
        )}

        {activeTab === "appeal" && (
          <div style={{ padding: 30, fontFamily: "'Crimson Text', serif", fontSize: "20px" }}>
            <h2 style={{ color: "#1a237e" }}>⚖️ Appeal Claim</h2>
            {appealed ? (
              <p>Your appeal has been submitted for review.</p>
            ) : (
              <p>No appeal made yet.</p>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div style={{ padding: 30, fontFamily: "'Crimson Text', serif", fontSize: "20px" }}>
            <h2 style={{ color: "#1a237e" }}>ℹ️ About Mullai</h2>
            <p>
              Mullai helps communities and officials analyze land claims under the Forest Rights Act. Users can
              select a land location, state the purpose of use, and get decisions based on rules and AI analysis.
              Claims can also be appealed for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

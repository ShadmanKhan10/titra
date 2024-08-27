import React, { useState, useEffect } from "react";
import Vector2d from "../libs/Vector2d";
import Match from "../libs/Match";
import Triangle from "../libs/Triangle";
import MathUtils from "../libs/MathUtils";
import Recognizer from "../libs/Recognizer";
import { io } from "socket.io-client";

function Detection() {
  const [angle, setAngle] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [touchPoints, setTouchPoints] = useState([]);
  const [recognizer, setRecognizer] = useState(null);

  const socket = io("http://192.168.1.8:3000");

  useEffect(() => {
    // Initialize the Recognizer with angles to detect
    const vertexAngles = [18, 36, 54, 72, 90, 108, 126]; // Angles for detection
    const newRecognizer = new Recognizer(vertexAngles, {
      maxPointDistance: 150,
      maxAngleTolerance: 5,
    });
    setRecognizer(newRecognizer);

    // Event listener for touch events on the touchscreen
    const handleTouchStart = (event) => {
      event.preventDefault();
      const points = Array.from(event.touches).map(
        (touch) => new Vector2d(touch.clientX, touch.clientY)
      );
      console.log("Touch start points:", points);
      setTouchPoints(points);
    };

    const handleTouchMove = (event) => {
      event.preventDefault();
      const points = Array.from(event.touches).map(
        (touch) => new Vector2d(touch.clientX, touch.clientY)
      );
      console.log("Touch move points:", points);
      setTouchPoints(points);
    };

    const handleTouchEnd = (event) => {
      event.preventDefault();
      const points = Array.from(event.touches).map(
        (touch) => new Vector2d(touch.clientX, touch.clientY)
      );
      console.log("Touch end points:", points);
      setTouchPoints(points);
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (touchPoints.length >= 3 && recognizer) {
      const matches = recognizer.findMatches(touchPoints);
      console.log("Matches found:", matches);

      if (matches.length > 0) {
        const match = matches[0]; // Assuming we just care about the first match
        setAngle(match.getApexAngle());
        setOrientation(match.getOrientation());
        console.log("Detected Angle:", match.getApexAngle());
        console.log("Detected Orientation:", match.getOrientation());
      } else {
        setAngle(null);
        setOrientation(null);
      }
    }
  }, [touchPoints, recognizer]);

  const sendMessageToServer = () => {
    socket.emit("message", "Established connection");
    console.log("Message sent to server: Established connection");
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>
            Disk Angle:{" "}
            {angle !== null ? angle.toFixed(2) + "°" : "No Disk Detected"}
          </h1>
          <h2>
            Orientation:{" "}
            {orientation !== null ? orientation.toFixed(2) + "°" : "N/A"}
          </h2>
          <div
            style={{
              transform: `rotate(${angle || 0}deg)`,
              width: "100px",
              height: "100px",
              border: "1px solid #000",
              margin: "50px auto",
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
            }}
          ></div>
          <div>
            <h2>Touch Points</h2>
            <ul>
              {touchPoints.map((point, index) => (
                <li key={index}>
                  Point X: {point.x}, Point Y: {point.y}
                </li>
              ))}
            </ul>
          </div>
        </header>
      </div>
      <button onClick={sendMessageToServer}>Establish Connection</button>
    </>
  );
}

export default Detection;

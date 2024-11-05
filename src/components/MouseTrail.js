// components/MouseTrail.js
import React, { useEffect } from "react";

const MouseTrail = () => {
  // Array to keep track of all trail elements for continuous line effect
  const trailElements = [];

  const createTrail = (e) => {
    // Create a new trail element
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.style.left = `${e.pageX}px`;
    trail.style.top = `${e.pageY}px`;

    // Set a random color for each trail
    const colors = ["#1cc5de", "#45ceca", "#4ada85", "#6fff90"];
    trail.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Add trail to the document and trailElements array
    document.body.appendChild(trail);
    trailElements.push(trail);

    // Remove the oldest trail element to create a continuous effect
    if (trailElements.length > 20) {
      const oldTrail = trailElements.shift(); // Remove the oldest trail
      oldTrail.remove(); // Remove it from the DOM
    }

    // Animate the trail's size and opacity
    setTimeout(() => {
      trail.style.transform = "scale(1.5)";
      trail.style.opacity = "0";
    }, 10);

    // Remove the trail element after the animation
    setTimeout(() => {
      trail.remove();
    }, 500);
  };

  useEffect(() => {
    document.addEventListener("mousemove", createTrail);
    return () => document.removeEventListener("mousemove", createTrail);
  }, []);

  return null; // No visible JSX for this component
};

export default MouseTrail;

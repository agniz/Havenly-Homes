import React from "react";
import "./About.scss";

const About = () => {
  return (
    <div className="about-container">
      <h1>About HavenlyHomes</h1>
      <p>
        Welcome to <strong>HavenlyHomes</strong>, your trusted platform for finding 
        and renting the perfect home. Whether you are looking for a cozy apartment, 
        a luxury villa, or a budget-friendly rental, we make the process easy and hassle-free.
      </p>

      <h2>Why Choose Us?</h2>
      <ul>
        <li>🔍 **Wide Range of Listings** – Explore verified properties across multiple locations.</li>
        <li>⚡ **Seamless Booking** – Secure your home with an easy booking process.</li>
        <li>🔒 **Trusted & Secure** – We ensure transparency and safety in all transactions.</li>
        <li>💬 **24/7 Customer Support** – Our team is always here to assist you.</li>
      </ul>

      <h2>Our Mission</h2>
      <p>
        Our mission is to revolutionize the house rental experience by providing 
        a user-friendly, reliable, and secure platform for renters and homeowners alike.
      </p>

      <h2>Contact Us</h2>
      <p>Email: support@havenlyhomes.com</p>
      <p>Phone: +123 456 7890</p>
    </div>
  );
};

export default About;

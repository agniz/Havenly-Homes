import React from "react";
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h4>About Us</h4>
          <p>
            HavenlyHomes is your trusted platform for finding and renting the perfect home.
          </p>
        </div>
        <div className="footer-section contact">
          <h4>Contact</h4>
          <p>Email: support@havenlyhomes.com</p>
          <p>Phone: +123 456 7890</p>
          <p>Address: 123 Main Street, City, Country</p>
        </div>
        <div className="footer-section socials">
          <h4>Follow Us</h4>
          <ul>
            <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} HavenlyHomes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

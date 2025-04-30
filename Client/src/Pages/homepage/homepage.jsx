import { useContext } from "react";
import SearchBar from "../../components/navbar/searchBar/SearchBar";
import "../homepage/homepage.scss";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/Footer/Footer";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="homePage">
      <div className="heroSection">
        <div className="contentWrapper">
          <div className="textContainer">
           
            <h1 className="title">
              Find Your <span className="highlight">Perfect</span> Home
            </h1>
            <p className="description">
              Discover your dream property with Havenly Homes. From luxury apartments to cozy rentals, 
              we help you find not just a house, but a place to call home.
            </p>
            <div className="searchBarWrapper">
              <SearchBar />
            </div>
          </div>
          <div className="imgContainer">
            <div className="decorCircle"></div>
            <img src="/bg.png" alt="Modern Home" className="heroImage" />
          </div>
        </div>
      </div>

      <div className="featuresSection">
        <h2 className="sectionTitle">Why Choose Havenly Homes?</h2>
        <div className="featuresGrid">
          <div className="featureCard">
            <div className="icon">🏠</div>
            <h3>Extensive Listings</h3>
            <p>Browse through thousands of verified properties across the city</p>
          </div>
          <div className="featureCard">
            <div className="icon">🔑</div>
            <h3>Easy Process</h3>
            <p>Simple and transparent property buying/renting process</p>
          </div>
          <div className="featureCard">
            <div className="icon">💎</div>
            <h3>Premium Properties</h3>
            <p>Access to exclusive luxury and premium listings</p>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
}

export default HomePage;

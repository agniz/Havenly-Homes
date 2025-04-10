import React, { useContext } from "react";
import SearchBar from "../../components/navbar/searchBar/SearchBar";
import { AuthContext } from "../../context/AuthContext";
import "./homepage.scss";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="homePage">
      <div className="contentWrapper">
        <div className="textContainer">
          <h1 className="title">Discover Your Dream Home</h1>
          <p className="description">
            With over 16 years of experience, our collection of more than 2,000 properties offers a perfect match for every lifestyle—from luxury estates to cozy rentals.
          </p>
          <div className="searchBarWrapper">
            <SearchBar />
          </div>
          <div className="statsWrapper">
            <div className="statCard">
              <h1>16+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className="statCard">
              <h1>200</h1>
              <h2>Awards Gained</h2>
            </div>
            <div className="statCard">
              <h1>2000+</h1>
              <h2>Properties Ready</h2>
            </div>
          </div>
        </div>
        <div className="imgContainer">
          <img src="/bg.png" alt="Elegant Home" />
        </div>
      </div>
    </div>
  );
}

export default HomePage;

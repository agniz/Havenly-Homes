import { Link } from "react-router-dom";
import "./card.scss";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Card({ item }) {
  const { currentUser } = useContext(AuthContext);

  const handleLinkClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      toast.warning("Please log in to view this property.");
    }
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer" onClick={handleLinkClick}>
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`} onClick={handleLinkClick}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">$ {item.price}</p>

        {/* Conditional rendering for sale or rent */}
        <div className={`statusTag ${item.type === 'rent' ? 'rent' : 'sale'}`}>
          {item.type === "rent" ? "For Rent" : "For Sale"}
        </div>

        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;

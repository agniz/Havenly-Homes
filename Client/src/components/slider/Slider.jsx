import { useState, useEffect, useCallback } from "react";
import "./slider.scss";

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const changeSlide = useCallback((direction) => {
    if (imageIndex === null) return;
    
    setIsLoading(true);
    
    if (direction === "left") {
      if (imageIndex === 0) {
        setImageIndex(images.length - 1);
      } else {
        setImageIndex(imageIndex - 1);
      }
    } else {
      if (imageIndex === images.length - 1) {
        setImageIndex(0);
      } else {
        setImageIndex(imageIndex + 1);
      }
    }
  }, [imageIndex, images]);

  const handleKeyDown = useCallback((e) => {
    if (imageIndex === null) return;
    
    if (e.key === "ArrowLeft") {
      changeSlide("left");
    } else if (e.key === "ArrowRight") {
      changeSlide("right");
    } else if (e.key === "Escape") {
      setImageIndex(null);
    }
  }, [imageIndex, changeSlide]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const openFullScreen = (index) => {
    setIsLoading(true);
    setImageIndex(index);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="slider">
      {imageIndex !== null && (
        <div className="fullSlider" role="dialog" aria-modal="true">
          <div className="arrow" onClick={() => changeSlide("left")} aria-label="Previous image">
            <img src="/arrow.png" alt="Previous" />
          </div>
          <div className="imgContainer">
            {isLoading && <div className="loading">Loading...</div>}
            <img 
              src={images[imageIndex]} 
              alt={`Property image ${imageIndex + 1}/${images.length}`} 
              onLoad={handleImageLoad}
            />
          </div>
          <div className="arrow" onClick={() => changeSlide("right")} aria-label="Next image">
            <img src="/arrow.png" className="right" alt="Next" />
          </div>
          <div className="close" onClick={() => setImageIndex(null)} aria-label="Close fullscreen">
            X
          </div>
          <div className="imageCounter">
            {imageIndex + 1}/{images.length}
          </div>
        </div>
      )}
      <div className="bigImage">
        <img 
          src={images[0]} 
          alt="Main property image" 
          onClick={() => openFullScreen(0)} 
        />
      </div>
      <div className="smallImages">
        {images.slice(1).map((image, index) => (
          <img
            src={image}
            alt={`Property image ${index + 2}`}
            key={index}
            onClick={() => openFullScreen(index + 1)}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;

import { useEffect, useMemo, useState } from "react";
import { loadJson } from "../lib/dataLoader";

function GalleryPage() {
  const [images, setImages] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let alive = true;

    loadJson("/assets/data/gallery.json")
      .then((payload) => {
        if (!alive) return;
        const galleryImages = payload.galleryImages || [];
        setImages(galleryImages);
        setSlideIndex(0);
      })
      .catch((error) => {
        console.error("Unable to load gallery data.", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  const activeImage = useMemo(() => {
    if (!images.length) return null;
    return images[slideIndex] || images[0];
  }, [images, slideIndex]);

  const showPrev = () => {
    if (!images.length) return;
    setSlideIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNext = () => {
    if (!images.length) return;
    setSlideIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="gallery-wrap">
      <br />
      <h2 className="text-center">Our Gallery</h2>
      <div className="container mb-5">
        <div className="gallery-main">
          {!activeImage ? (
            <div className="my-slide d-block text-center py-5">No images found</div>
          ) : (
            <div className="my-slide d-block">
              <div className="numbertext">{activeImage.numberText || `${slideIndex + 1} / ${images.length}`}</div>
              <center>
                <img
                  src={activeImage.src.startsWith("/") ? activeImage.src : `/${activeImage.src}`}
                  alt={activeImage.alt || "Gallery image"}
                  loading="eager"
                  decoding="async"
                />
              </center>
            </div>
          )}
        </div>

        <button type="button" className="prev" onClick={showPrev}>
          &#10094;
        </button>
        <button type="button" className="next" onClick={showNext}>
          &#10095;
        </button>

        <div className="caption-container">
          <p className="mb-0">{activeImage ? activeImage.alt : ""}</p>
        </div>

        <div className="thumb-row">
          {images.map((image, index) => (
            <div key={image.src} className="thumb-col">
              <img
                src={image.src.startsWith("/") ? image.src : `/${image.src}`}
                alt={image.alt || "Image"}
                className={index === slideIndex ? "active" : ""}
                loading="lazy"
                decoding="async"
                onClick={() => setSlideIndex(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryPage;

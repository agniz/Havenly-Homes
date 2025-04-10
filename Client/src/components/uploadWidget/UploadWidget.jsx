import { createContext, useEffect, useState } from "react";

const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, setPublicId, setState }) {
  const [loaded, setLoaded] = useState(false);
  const [widget, setWidget] = useState(null);

  useEffect(() => {
    if (!document.getElementById("uw")) {
      const script = document.createElement("script");
      script.setAttribute("async", "");
      script.setAttribute("id", "uw");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.addEventListener("load", () => setLoaded(true));
      document.body.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded && !widget) {
      const myWidget = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            setState((prev) => [...prev, result.info.secure_url]);
          }
        }
      );
      setWidget(myWidget);
    }
  }, [loaded, widget, uwConfig, setState]);

  const openWidget = () => {
    if (widget) {
      widget.open();
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <button id="upload_widget" className="cloudinary-button" onClick={openWidget}>
        Upload
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default UploadWidget;
export { CloudinaryScriptContext };

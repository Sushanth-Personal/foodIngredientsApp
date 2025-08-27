import React, { useState } from "react";
import { resizeAndCompressImage } from "./utils"; // optional if you have preprocessing logic

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setIngredients([]);
    setLoading(true);
    setError(null);

    // Optional: preprocess file before sending
    const processedFile = await resizeAndCompressImage(file, 512, 512);

    const formData = new FormData();
    formData.append("image", processedFile);

    try {
      const response = await fetch(
        "https://api.logmeal.com/v2/image/segmentation/complete/v1.0?language=eng",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      // Extract ingredient names and remove duplicates
      const detectedIngredients =
        data.segmentation_results
          ?.map((item) => item.recognition_results[0].name)
          .filter((value, index, self) => self.indexOf(value) === index) || [];

      setIngredients(detectedIngredients);
    } catch (err) {
      console.error("Error calling API:", err);
      setError("Failed to recognize ingredients. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style = {styles.window}>
    <div style={styles.container}>
      <h1 style={styles.title}>🍴 Ingredient Detector</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={styles.input}
      />

      {selectedImage && (
        <img
          src={selectedImage}
          alt="Uploaded"
          style={styles.image}
        />
      )}

      {loading && <p style={styles.loading}>Detecting ingredients...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {ingredients.length > 0 && (
        <div style={styles.ingredientsContainer}>
          <h3 style ={styles.ingredientsTitle}> Detected Ingredients:</h3>
          <ul style={styles.list}>
            {ingredients.map((item, i) => (
              <li key={i} style={styles.listItem}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </section>
  );
}

// Simple inline styles
const styles = {
  window:{
    display:"flex",
    justifyContent: "centre",
    width: "100vw"
  },
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  ingredientsTitle: {
    color:"#000000",
    fontWeight:"700"
  },
  input: {
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  loading: {
    color: "#555",
    fontStyle: "italic",
  },
  error: {
    color: "red",
  },
  ingredientsContainer: {
    marginTop: "20px",
    textAlign: "left",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    backgroundColor: "#fff",
    color: "#000000",
    padding: "10px 15px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
};

export default App;

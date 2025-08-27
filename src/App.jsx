import React, { useState } from "react";
import { resizeAndCompressImage } from "./utils";
import { getRecipeFromIngredients } from "./puterClient";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setIngredients([]);
    setRecipes([]);
    setLoading(true);
    setLoadingMessage("Detecting ingredients...");
    setError(null);

    const processedFile = await resizeAndCompressImage(file, 512, 512);
    const formData = new FormData();
    formData.append("image", processedFile);

    try {
      // Upload image to LogMeal API
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

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();

      // Extract unique ingredient names
      const detectedIngredients =
        data.segmentation_results
          ?.map((item) => item.recognition_results[0].name)
          .filter((v, i, self) => self.indexOf(v) === i) || [];

      setIngredients(detectedIngredients);

      if (detectedIngredients.length > 0) {
        setLoadingMessage("Fetching recipe suggestions...");

        // Wait until Puter.js is loaded
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (window.puter) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });

        // Get recipe suggestions from Puter.js
        const recipeSuggestions = await getRecipeFromIngredients(detectedIngredients);
        setRecipes(recipeSuggestions); // split for display
      }
    } catch (err) {
      console.error(err);
      setError("Failed to recognize ingredients or fetch recipes.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <section style={styles.window}>
      <div style={styles.container}>
        <h1 style={styles.title}>🍴 Ingredient Detector</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={styles.input}
        />

        {selectedImage && (
          <img src={selectedImage} alt="Uploaded" style={styles.image} />
        )}

        {loading && <p style={styles.loading}>{loadingMessage}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {ingredients.length > 0 && (
          <div style={styles.ingredientsContainer}>
            <h3 style={styles.ingredientsTitle}>Detected Ingredients:</h3>
            <ul style={styles.horizontalList}>
              {ingredients.map((item, i) => (
                <li key={i} style={styles.listItem}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {recipes.length > 0 && (
          <div style={styles.recipesContainer}>
            <h3 style={styles.recipesTitle}>🍲 Recipe Suggestions:</h3>
            <ul style={styles.horizontalList}>
              {recipes.map((recipe, i) => (
                <li key={i} style={styles.recipeItem}>{recipe}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  window: {
    display: "flex",
    justifyContent: "center",
    width: "100vw",
  },
  container: {
    padding: "30px",
    maxWidth: "700px",
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
  recipesContainer: {
    marginTop: "20px",
    textAlign: "left",
  },
  ingredientsTitle: {
    color: "#000",
    fontWeight: "700",
  },
  recipesTitle: {
    color: "#000",
    fontWeight: "700",
  },
  horizontalList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    padding: 0,
    listStyle: "none",
  },
  listItem: {
    backgroundColor: "#fff",
    color: "#000",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  recipeItem: {
    backgroundColor: "#fff",
    color: "#000",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
};

export default App;

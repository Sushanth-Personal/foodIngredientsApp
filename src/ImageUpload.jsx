import React, { useState } from "react";

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const API_TOKEN = import.meta.env.VITE_API_TOKEN; // replace with your token

  console.log(API_TOKEN);
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setIngredients([]);

    // Prepare form data
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        "https://api.logmeal.com/v2/recognition/complete", // example endpoint
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      // Assuming data contains something like data.ingredients
      // Update based on the API response structure
      const detectedIngredients = data.ingredients?.map(item => item.name) || [];
      setIngredients(detectedIngredients);
    } catch (err) {
      console.error("Error calling API:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload an Image for Ingredient Detection</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded" width="300" style={{ margin: "10px" }} />}

      <h3>Detected Ingredients:</h3>
      <ul>
        {ingredients.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default ImageUpload;

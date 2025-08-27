import React, { useEffect } from "react";
import * as ort from "onnxruntime-web";

const YoloTest = () => {
  useEffect(() => {
    const runModel = async () => {
      try {
        // Load YOLOv8 model (from public folder)
        const session = await ort.InferenceSession.create("/yolov8n.onnx");

        console.log("✅ Model loaded successfully");

        // Example: load a test image (should be in /public/test.jpg or similar)
        const image = new Image();
        image.src = "/test.jpg"; // <-- put a sample image in your public folder
        image.crossOrigin = "anonymous";

        image.onload = async () => {
          // Convert image to tensor
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 640; // YOLOv8 expects 640x640
          canvas.height = 640;
          ctx.drawImage(image, 0, 0, 640, 640);
          const imageData = ctx.getImageData(0, 0, 640, 640);

          // Convert to float32 tensor [1,3,640,640]
          const data = Float32Array.from(imageData.data)
            .filter((_, i) => i % 4 !== 3) // drop alpha
            .map(v => v / 255.0); // normalize 0-1

          const transposed = new Float32Array(3 * 640 * 640);
          let idx = 0;
          for (let c = 0; c < 3; c++) {
            for (let y = 0; y < 640; y++) {
              for (let x = 0; x < 640; x++) {
                transposed[c * 640 * 640 + y * 640 + x] =
                  data[y * 640 * 3 + x * 3 + c];
              }
            }
          }

          const tensor = new ort.Tensor("float32", transposed, [1, 3, 640, 640]);

          // Run inference
          const results = await session.run({ images: tensor });

          console.log("📊 Inference results:", results);
        };
      } catch (err) {
        console.error("❌ Error running model:", err);
      }
    };

    runModel();
  }, []);

  return (
    <div>
      <h2>YOLOv8 Test</h2>
      <p>Check the console for model load + inference results.</p>
    </div>
  );
};

export default YoloTest;


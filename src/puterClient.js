export async function getRecipeFromIngredients(ingredients) {
  if (!window.puter) throw new Error("Puter SDK not loaded");

  const prompt = `
You are a chef assistant. Given the following ingredients detected in an image: ${ingredients.join(
    ", "
  )}, 
suggest 5 commonly known dishes that can be made using only these ingredients. 
Do not include ingredients that are not listed. 
Use the most popular or commonly used names for the dishes. 
Return only the dish names, separated by new lines.
`;

  const response = await window.puter.ai.chat(prompt);

  // Extract the content from Puter response
  const content = response.message?.content || "";
  console.log("Puter output:", content.split("\n"));

  return content.split("\n");
}

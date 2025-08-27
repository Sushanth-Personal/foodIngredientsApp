export async function getRecipeFromIngredients(ingredients) {
  if (!window.puter) throw new Error("Puter SDK not loaded");

  const prompt = `Given the following ingredients, suggest 5 dishes I can cook: ${ingredients.join(
    ", "
  )}. Return only the dish names, separated by new lines.`;

  const response = await window.puter.ai.chat(prompt);

  // Extract the content from Puter response
  const content = response.message?.content || "";
  console.log(content.split('\n'));

  return content
    .split("\n");
}

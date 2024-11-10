
require('dotenv').config();



// Function to split paragraph text into individual sentences


function splitIntoSentences(paragraphText) {
  return paragraphText.match(/[^\.!\?]+[\.!\?]+/g) || []; // Split by sentence-ending punctuation
}

// Placeholder function to check if a sentence contains fake news using OpenAI API
async function checkFakeNews(sentence) {
  const apiKey = process.env.API_KEY; // Replace with your actual OpenAI API key

  // Basic check for incomplete or nonsensical sentences
  if (sentence.length < 10 || !/[.!?]/.test(sentence)) {
    console.log("Sentence too short or incomplete, assuming true:", sentence);
    return false; // Assume true (not fake) for short or incomplete sentences
  }

  const prompt = `Return "true" or "false" (one word only) if the following news is true or false:\n\n"${sentence}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that verifies news authenticity." },
          { role: "user", content: prompt }
        ],
        max_tokens: 5,
        temperature: 0,
      })
    });

    const data = await response.json();
    const result = data.choices[0].message.content.trim().toLowerCase();

    // Check if the response is "false" and return true to indicate it's fake news
    return result === "false";
  } catch (error) {
    console.error("Error checking fake news:", error);
    return false; // Default to true (not fake) if there's an error
  }
}


// Function to highlight a paragraph sentence by sentence

async function highlightParagraphBySentence(paragraphNode) {
  const sentences = splitIntoSentences(paragraphNode.nodeValue);
  const fragment = document.createDocumentFragment();

  for (let sentence of sentences) {
    // Check if the sentence is fake news
    const isFake = await checkFakeNews(sentence);

    // Create a span element for each sentence
    const span = document.createElement("span");
    span.textContent = sentence + " "; // Add a space to separate sentences visually

    // If the sentence is fake news, style it; otherwise, keep it as is
    if (isFake) {
      span.style.color = "red";
      span.style.fontWeight = "bold";
    }

    // Append each sentence span to the fragment, preserving all text
    fragment.appendChild(span);
  }

  // Replace the original paragraph node with the newly created fragment
  if (paragraphNode.parentNode) {
    paragraphNode.parentNode.replaceChild(fragment, paragraphNode);
  }
}

// Recursive function to traverse and highlight paragraphs by sentence
async function traverseAndHighlight(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    await highlightParagraphBySentence(node); // Process each paragraph sentence by sentence
  } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
    for (let child of node.childNodes) {
      await traverseAndHighlight(child);
    }
  }
}

// Main function to toggle highlighting on or off
function toggleHighlighting(enabled) {
  console.log("toggleHighlighting function called with enabled:", enabled);

  if (enabled) {
    console.log("Highlighting enabled. Calling traverseAndHighlight...");
    traverseAndHighlight(document.body);
  } else {
    console.log("Highlighting disabled. Reloading page to remove highlights.");
    location.reload(); // Reloads the page to remove highlights
  }
}


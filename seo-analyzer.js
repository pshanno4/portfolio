function analyzeSEO() {
  const inputText = document.getElementById("seo-input").value;
  const resultsDiv = document.getElementById("seo-results");
  
  if (inputText.trim() === "") {
    resultsDiv.innerHTML = "<p>Please enter content to analyze.</p>";
    return;
  }

  let feedback = "<h3>SEO Analysis Results</h3><ul>";
  let suggestions = [];
  
  // Check for keyword presence
  const keyword = "freelance writer";
  if (!inputText.toLowerCase().includes(keyword)) {
    suggestions.push("Consider including your target keyword: '<b>freelance writer</b>' for better optimization.");
  }
  
  // Check content length
  if (inputText.length < 300) {
    suggestions.push("Your content is quite short. Aim for at least 300-500 words for better SEO.");
  }
  
  // Check readability
  if (inputText.split(".").length < 5) {
    suggestions.push("Your text might be too simplistic. Consider adding more detailed sentences.");
  }
  
  // Call-to-action if not optimized
  if (suggestions.length > 0) {
    feedback += `<li>Your content could be improved for SEO. Here are some suggestions:</li>`;
    feedback += `<ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
    feedback += "<p><b>Need expert SEO writing?</b> <a href='index.html#contact'>Reach out to Paul Shannon</a> for professional content optimization.</p>";
  } else {
    feedback += "<li>Your content is well-optimized for SEO!</li>";
  }
  
  feedback += "</ul>";
  resultsDiv.innerHTML = feedback;
}

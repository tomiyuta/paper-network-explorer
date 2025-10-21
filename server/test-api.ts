// Test Semantic Scholar API directly
async function testSemanticScholarAPI() {
  try {
    console.log("Testing Semantic Scholar API...");
    
    const searchUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent("Attention is all you need")}&fields=paperId,title,abstract,year,citationCount,referenceCount,authors,venue,externalIds,url&limit=1`;
    
    console.log("Search URL:", searchUrl);
    
    const response = await fetch(searchUrl);
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const text = await response.text();
      console.error("Error response:", text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Success! Data:", JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

testSemanticScholarAPI();


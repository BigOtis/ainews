// src/resumeAPI.js or src/utils/resumeAPI.js

const fetchOptimizedResume = async (resume, jobListing) => {
  try {
    const apiUrl = "/api/optimize-resume";

    console.log(`Submitting resume (${resume}) for ${jobListing}...`);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText: resume, jobDescriptionText: jobListing }),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      // Handle any errors from the server.
      throw new Error("Failed to optimize resume");
    }
  } catch (error) {
    console.error("Error fetching optimized resume:", error);
    return null;
  }
};

export default fetchOptimizedResume;

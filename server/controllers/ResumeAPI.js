// Import the necessary modules
const { Configuration, OpenAIApi } = require("openai");

//const model = "gpt-4"; // Use this for PRODUCTION
const model = "gpt-3.5-turbo" // Use this for TESTING (Cheaper / Faster)

/**
 * This function optimizes a resume based on a given job description.
 * @param {string} resumeText - The text of the resume to be optimized.
 * @param {string} jobDescriptionText - The text of the job description to optimize the resume for.
 * @returns {string} The optimized resume.
 */
const optimizeResume = async (resumeText, jobDescriptionText) => {
  // Set up the OpenAI API configuration
  const configuration = new Configuration({
    apiKey: process.env.API_KEY_VALUE,
  });

  // Create a new OpenAI API instance with the configuration
  const openai = new OpenAIApi(configuration);

  try {
    // Call the OpenAI API to optimize the resume
    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in optimizing resumes based on job listings.",
        },
        {
          role: "user",
          content: `Optimize this resume ${resumeText} for the following job listing: ${jobDescriptionText}`,
        },
      ],
    });

    // Extract the optimized resume from the API response
    const optimizedResume = response.data.choices[0].message.content;

    // Return the optimized resume
    return optimizedResume;
  } catch (error) {
    // Log any errors to the console and return null
    console.error(error);
    return null;
  }
};

/**
 * This function handles HTTP requests to optimize resumes.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
const resumeOptimizerHandler = async (req, res) => {
  try {
    // Extract the resume text and job description text from the request body
    const { resumeText, jobDescriptionText } = req.body;

    // Call the optimizeResume function to optimize the resume
    const optimizedResume = await optimizeResume(resumeText, jobDescriptionText);

    // Send the optimized resume as a response with an HTTP status code of 200
    res.status(200).json({ optimizedResume });
  } catch (error) {
    // Log any errors to the console and send an HTTP status code of 500 with an error message as the response
    console.error(error);
    res.status(500).json({ message: 'Error optimizing resume' });
  }
};

// Export the optimizeResume and resumeOptimizerHandler functions for use in other modules
module.exports = {
  optimizeResume,
  resumeOptimizerHandler
};

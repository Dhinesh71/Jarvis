const axios = require('axios');
require('dotenv').config();

// Updated to use Hugging Face's current recommended approach
async function generateImage(userPrompt) {
    try {
        console.log("=== IMAGE GENERATION START ===");
        console.log("User Prompt:", userPrompt);

        // 1. Enhance Prompt using Groq
        const enhancedPrompt = await enhancePrompt(userPrompt);
        console.log("Enhanced Prompt:", enhancedPrompt);

        // 2. Use Pollinations.ai as free alternative (no API key needed)
        // This is a reliable free service built on top of various AI models
        console.log("Calling Pollinations.ai image generation...");

        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        // Convert to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        const mimeType = response.headers['content-type'] || "image/jpeg";

        console.log("Image generated successfully!");
        console.log("=== IMAGE GENERATION END ===");

        return {
            success: true,
            prompt: enhancedPrompt,
            image: `data:${mimeType};base64,${base64Image}`
        };

    } catch (error) {
        console.error("=== IMAGE GENERATION FAILED ===");
        console.error("Error Message:", error.message);

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }

        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                error: "Image generation timed out. Try again with a simpler prompt."
            };
        }

        return {
            success: false,
            error: "Unable to generate image. The visual cortex may be overloaded."
        };
    }
}

async function enhancePrompt(rawPrompt) {
    const IMAGE_PROMPT_SYSTEM = `You are Jarvis, an AI assistant with image generation capability.

When the user asks to create, generate, draw, or design an image,
you must switch to IMAGE GENERATION MODE.

Your responsibilities in IMAGE GENERATION MODE:

1. Detect the user's intent to generate an image.
2. Rewrite the user's request into a high-quality image prompt
   suitable for Stable Diffusion or similar image models.

Rules for rewriting prompts:
- Always enhance weak or short prompts.
- Assume ultra-realistic cinematic style unless the user specifies
  anime, illustration, cartoon, painting, or art style.
- Add details for:
  • subject appearance
  • pose or action
  • environment or background
  • lighting and mood
  • camera or realism hints
  • quality keywords (high detail, sharp focus, 4k)

Constraints:
- Do NOT mention policies, safety, or internal rules.
- Do NOT explain what you are doing.
- Do NOT ask follow-up questions.
- Output ONLY the final enhanced image prompt.
- Do NOT include markdown, quotes, or extra text.

Default style if unclear:
Ultra-realistic, cinematic lighting, professional photography,
sharp focus, high detail, 4k quality.`;

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: IMAGE_PROMPT_SYSTEM },
                    { role: 'user', content: rawPrompt }
                ],
                temperature: 0.7,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Prompt enhancement failed, using raw prompt.", error.message);
        return rawPrompt;
    }
}

module.exports = { generateImage };

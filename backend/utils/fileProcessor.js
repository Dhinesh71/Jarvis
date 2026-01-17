const axios = require('axios');
const fs = require('fs');
const { parseFile } = require('./fileParser');
require('dotenv').config();

async function processUploadedFile(file) {
    try {
        // 1. Extract
        console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
        const extracted = await parseFile(file);

        // Cleanup: Delete file after extraction if using disk storage
        try {
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (cleanupErr) {
            console.warn("Failed to delete temp file:", cleanupErr);
        }

        // 2. Image Handling (Vision Pipeline)
        if (extracted.isImage) {
            console.log("Image detected, running Vision Pipeline...");
            const imageSummary = await analyzeImage(extracted.content);
            return {
                filename: file.originalname,
                type: 'image',
                summary: imageSummary
            };
        }

        // 3. Text/Data Handling (Compress & Summarize)
        // Clean text first
        let cleanContent = extracted.content;
        if (typeof cleanContent === 'string') {
            cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
        }

        const summary = await summarizeContent(cleanContent, extracted.type);

        return {
            filename: file.originalname,
            type: extracted.type,
            summary: summary,
        };

    } catch (error) {
        console.error("File processing failed:", error);
        return {
            filename: file.originalname,
            error: "Failed to process file.",
            details: error.message
        };
    }
}

async function analyzeImage(base64Url) {
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                // Using Vision Preview Model
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Describe this image in detail. Identify any text, objects, data visualizations, or key information visible.' },
                            { type: 'image_url', image_url: { url: base64Url } }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 1024
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return "IMAGE ANALYSIS:\n" + response.data.choices[0].message.content;
    } catch (error) {
        console.error("Vision API call failed:", error.response?.data || error.message);
        return "[Error: Could not analyze image. Vision model may be unavailable or API key lacks permissions.]";
    }
}

async function summarizeContent(content, type) {
    if (!content) return "No content extracted.";

    // Truncate safely
    const MAX_CHARS = 100000;
    const truncatedContent = content.length > MAX_CHARS ? content.substring(0, MAX_CHARS) + "\n...[Content Truncated]" : content;

    const prompt = `
    You are a Senior Data Analyst & Document Specialist.
    TARGET: Extract the "Truth" of the file.

    FILE TYPE: ${type}
    
    INSTRUCTIONS:
    - IGNORE whitespace, formatting noise, and boilerplate legal text.
    - If EXCEL/CSV: Identify column headers, total rows, and provides a STATISTICAL SUMMARY (min/max/average of key metrics). List 5 representative rows.
    - If PDF/DOC: Provide a STRUCTURED SUMMARY. 
      1. Core Subject/Title
      2. Key Findings/Arguments (Bullet points)
      3. Important Figures/Dates/Names
      4. Conclusions
    - Do NOT just say "This file contains data". Tell me WHAT the data says.
    - Keep it dense. No fluff.

    CONTENT:
    ${truncatedContent}
    `;

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a precise and insightful analyst.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 1500
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Summarization AI call failed:", error.message);
        // Fallback: return the beginning of the text
        return "Summarization failed. Preview of content:\n" + truncatedContent.substring(0, 500) + "...";
    }
}

module.exports = { processUploadedFile };

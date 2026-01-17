const axios = require('axios');
require('dotenv').config();

async function testHuggingFace() {
    try {
        console.log('Testing Hugging Face API...');
        console.log('Token:', process.env.HF_API_TOKEN);

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
            { inputs: 'a beautiful sunset over mountains, vibrant colors, 4k' },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
                timeout: 60000
            }
        );

        console.log('✓ Success! Status:', response.status);
        console.log('✓ Content-Type:', response.headers['content-type']);
        console.log('✓ Data size:', response.data.length, 'bytes');

        // Save test image
        const fs = require('fs');
        fs.writeFileSync('test-output.png', response.data);
        console.log('✓ Test image saved as test-output.png');

    } catch (error) {
        console.error('✗ Error:', error.message);
        if (error.response) {
            console.error('✗ Status:', error.response.status);
            console.error('✗ Status Text:', error.response.statusText);
            try {
                const data = error.response.data.toString();
                console.error('✗ Data:', data);
            } catch (e) {
                console.error('✗ Could not parse error data');
            }
        }
    }
}

testHuggingFace();

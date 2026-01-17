const axios = require('axios');

async function test() {
    const url = 'http://localhost:5000/chat';

    try {
        // Test 1: General Question (Should NOT mention Dhinesh)
        console.log('Test 1: General Question...');
        const res1 = await axios.post(url, { message: 'What architecture do you run on?', history: [] });
        const content1 = res1.data.response;
        console.log('Response 1:', content1);

        if (content1.includes('Dhinesh') || content1.includes('Full Stack Developer')) {
            console.error('FAIL: Leaked user details in general question.');
        } else {
            console.log('PASS: No user details leaked.');
        }

        // Test 2: Specific Question (Should mention Dhinesh)
        console.log('\nTest 2: Who created you?');
        const res2 = await axios.post(url, { message: 'Who created you?', history: [] });
        const content2 = res2.data.response;
        console.log('Response 2:', content2);

        if (content2.toLowerCase().includes('dhinesh')) {
            console.log('PASS: Correctly identified creator.');
        } else {
            console.error('FAIL: Did not identify creator when asked.');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

test();

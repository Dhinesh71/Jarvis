const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const csv = require('csv-parser');

async function parseFile(file) {
    const { path: filePath, mimetype, originalname, buffer } = file;

    try {
        // Helper to get buffer (from memory or disk)
        const getBuffer = () => {
            if (buffer) return buffer;
            if (filePath) return fs.readFileSync(filePath);
            throw new Error("No file content found");
        };

        if (mimetype === 'application/pdf') {
            const dataBuffer = getBuffer();
            const data = await pdf(dataBuffer);
            return { type: 'pdf', content: data.text, metadata: data.info };
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
            // Mammoth supports buffer
            const dataBuffer = getBuffer();
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return { type: 'docx', content: result.value };
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') { // xlsx
            const dataBuffer = getBuffer();
            const workbook = xlsx.read(dataBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            return { type: 'excel', content: JSON.stringify(data, null, 2) };
        }
        else if (mimetype === 'text/csv' || mimetype === 'application/csv') {
            return new Promise((resolve, reject) => {
                const results = [];
                const dataBuffer = getBuffer();
                // Create stream from buffer
                const stream = require('stream');
                const bufferStream = new stream.PassThrough();
                bufferStream.end(dataBuffer);

                bufferStream
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        resolve({ type: 'csv', content: JSON.stringify(results, null, 2) });
                    })
                    .on('error', (err) => reject(err));
            });
        }
        else if (mimetype.startsWith('image/')) {
            const dataBuffer = getBuffer();
            const base64Image = dataBuffer.toString('base64');
            const dataUrl = `data:${mimetype};base64,${base64Image}`;
            return { type: 'image', content: dataUrl, isImage: true };
        }
        else if (mimetype.startsWith('text/')) {
            const dataBuffer = getBuffer();
            const content = dataBuffer.toString('utf8');
            return { type: 'text', content: content };
        }

        throw new Error(`Unsupported file type: ${mimetype}`);

    } catch (error) {
        console.error('File parsing error:', error);
        throw error;
    }
}

module.exports = { parseFile };

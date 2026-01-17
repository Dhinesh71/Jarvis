const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const csv = require('csv-parser');

async function parseFile(file) {
    const { path: filePath, mimetype, originalname } = file;

    try {
        if (mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return { type: 'pdf', content: data.text, metadata: data.info };
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
            const result = await mammoth.extractRawText({ path: filePath });
            return { type: 'docx', content: result.value };
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') { // xlsx
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            return { type: 'excel', content: JSON.stringify(data, null, 2) };
        }
        else if (mimetype === 'text/csv' || mimetype === 'application/csv') {
            return new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        resolve({ type: 'csv', content: JSON.stringify(results, null, 2) });
                    })
                    .on('error', (err) => reject(err));
            });
        }
        else if (mimetype.startsWith('image/')) {
            // Read image as base64 for Vision Model
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:${mimetype};base64,${base64Image}`;
            return { type: 'image', content: dataUrl, isImage: true };
        }
        else if (mimetype.startsWith('text/')) {
            const content = fs.readFileSync(filePath, 'utf8');
            return { type: 'text', content: content };
        }

        throw new Error(`Unsupported file type: ${mimetype}`);

    } catch (error) {
        console.error('File parsing error:', error);
        throw error;
    }
}

module.exports = { parseFile };

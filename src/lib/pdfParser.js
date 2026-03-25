import { getDocument } from 'pdfjs-dist';

/**
 * Extracts all text from a PDF file (as ArrayBuffer or File).
 * @param {File|ArrayBuffer} pdfFile
 * @returns {Promise<string>} The extracted text
 */
export async function extractPdfText(pdfFile) {
  let data;
  if (pdfFile instanceof File) {
    data = await pdfFile.arrayBuffer();
  } else {
    data = pdfFile;
  }
  const pdf = await getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

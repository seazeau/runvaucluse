import { PdfReader } from "pdfreader";

async function extractTextFromPdf(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let fullText = "";
        new PdfReader({}).parseFileItems(filePath, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve(fullText);
            else if (item.text) fullText += item.text + " ";
        });
    });
}

async function main() {
    const text = await extractTextFromPdf("résultats/resultats_semi_nesque_2026.pdf");
    console.log(text.substring(0, 5000));
}

main().catch(console.error);

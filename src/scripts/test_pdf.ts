import { PdfReader } from "pdfreader";

async function testPdf(filePath: string) {
    console.log(`Reading PDF with pdfreader: ${filePath}`);
    
    let fullText = "";
    new PdfReader({}).parseFileItems(filePath, (err, item) => {
        if (err) console.error("error:", err);
        else if (!item) {
            console.log("--- Content Start ---");
            console.log(fullText.substring(0, 3000));
            console.log("--- Content End ---");
        }
        else if (item.text) {
            fullText += item.text + " ";
        }
    });
}

testPdf(process.argv[2]);

import { tools } from './tools';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CSVRecord = Record<string, string>;
type ExcelRecord = Record<string, string | number | boolean | null>;

async function testCSVParsing(): Promise<CSVRecord[]> {
    try {
        console.log('Testing CSV Parsing...');
        const csvPath = path.join(__dirname, 'jobs - Sheet1.csv');
        const csvResult = await tools.parseCSV.execute(
            { filePath: csvPath },
            { toolCallId: 'csv-parse', messages: [] }
        ) as CSVRecord[];
        
        console.log('\nCSV Parsing Result:');
        console.log('Number of records:', csvResult.length);
        console.log('First record:', csvResult[0]);
        console.log('All records:', JSON.stringify(csvResult, null, 2));
        
        return csvResult;
    } catch (error) {
        console.error('CSV Parsing Test Failed:', error);
        throw error;
    }
}

async function testExcelParsing(): Promise<Record<string, ExcelRecord[]>> {
    try {
        console.log('\nTesting Excel Parsing...');
        const excelPath = path.join(__dirname, 'jobs.xlsx');
        const excelResult = await tools.parseExcel.execute(
            { filePath: excelPath },
            { toolCallId: 'excel-parse', messages: [] }
        ) as Record<string, ExcelRecord[]>;
        
        console.log('\nExcel Parsing Result:');
        console.log('Number of sheets:', Object.keys(excelResult).length);
        
        // Print each sheet's data
        Object.entries(excelResult).forEach(([sheetName, data]) => {
            console.log(`\nSheet: ${sheetName}`);
            console.log('Number of records:', data.length);
            console.log('First record:', data[0]);
            console.log('All records:', JSON.stringify(data, null, 2));
        });
        
        return excelResult;
    } catch (error) {
        console.error('Excel Parsing Test Failed:', error);
        throw error;
    }
}

async function runTests() {
    try {
        // Test CSV parsing
        const csvData = await testCSVParsing();
        
        // Test Excel parsing
        const excelData = await testExcelParsing();
        
        // Compare the data if both files contain the same information
        console.log('\nComparing CSV and Excel data...');
        const firstSheet = Object.values(excelData)[0];
        if (firstSheet && csvData.length === firstSheet.length) {
            console.log('Both files contain the same number of records');
        } else {
            console.log('Files contain different number of records');
        }
        
    } catch (error) {
        console.error('Test Suite Failed:', error);
    }
}

// Run the tests and handle any unhandled promise rejections
runTests().catch(error => {
    console.error('Unhandled error in test suite:', error);
    process.exit(1);
}); 
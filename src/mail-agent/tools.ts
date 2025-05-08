import { tool as createTool } from "ai";
import { z } from "zod";
import fs from "fs/promises";
import { pdfToText } from "pdf-ts";
import csv from "csvtojson";
import ExcelJS from "exceljs";

// PDF parser tool
const parsePdf = createTool({
  description: "Parse a PDF file and extract its text content.",
  parameters: z.object({
    filePath: z.string().describe("The path to the PDF file to be parsed."),
  }),
  execute: async ({ filePath }) => {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const text = await pdfToText(dataBuffer);
      return text;
    } catch (error) {
      console.error("Error reading file:", error);
      throw new Error("Failed to read the PDF file.");
    }
  },
});

// CSV parser tool
const parseCSV = createTool({
  description: "Parse a CSV file and return its contents as JSON.",
  parameters: z.object({
    filePath: z.string().describe("The path to the CSV file."),
  }),
  execute: async ({ filePath }) => {
    try {
      const jsonObj = await csv().fromFile(filePath);
      return jsonObj;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw new Error("Failed to parse the CSV file.");
    }
  },
});

// Excel parser tool
const parseExcel = createTool({
  description:
    "Parse an Excel (.xlsx) file and return its content as JSON (sheet-wise).",
  parameters: z.object({
    filePath: z.string().describe("The path to the Excel file."),
  }),
  execute: async ({ filePath }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const result: Record<string, any[]> = {};

      workbook.eachSheet((worksheet, sheetId) => {
        const sheetData: any[] = [];
        const headers: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
          const rowValues = row.values as string[];
          if (rowNumber === 1) {
            rowValues.forEach((val, idx) => {
              if (idx > 0) headers.push(String(val || ""));
            });
          } else {
            const rowObj: Record<string, any> = {};
            headers.forEach((header, idx) => {
              rowObj[header] = rowValues[idx + 1] ?? "";
            });
            sheetData.push(rowObj);
          }
        });

        result[worksheet.name] = sheetData;
      });

      return result;
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      throw new Error("Failed to parse the Excel file.");
    }
  },
});

// Export all tools
export const tools = {
  parsePdf,
  parseCSV,
  parseExcel,
};

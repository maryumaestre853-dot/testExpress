import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

export const JsonStorage = {
  async readCollection(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const rawContent = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(filePath, '[]', 'utf-8');
        return [];
      }
      throw error;
    }
  },

  async writeCollection(fileName, records) {
    const filePath = path.join(DATA_DIR, fileName);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
  },

  generateNextId(records, idField = 'id') {
    if (records.length === 0) return 1;
    const maxId = Math.max(...records.map((item) => Number(item[idField]) || 0));
    return maxId + 1;
  },
};
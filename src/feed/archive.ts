import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PostedRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARCHIVE_FILE = path.resolve(__dirname, '../../data/posted_archive.json');

export async function getPostedArchive(): Promise<PostedRecord[]> {
  try {
    const raw = await fs.readFile(ARCHIVE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(ARCHIVE_FILE), { recursive: true });
      await fs.writeFile(ARCHIVE_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    throw err;
  }
}

export async function isStoryPosted(storyId: string): Promise<boolean> {
  const archive = await getPostedArchive();
  return archive.some((record) => record.storyId === storyId);
}

export async function recordPostedStory(record: PostedRecord): Promise<void> {
  const archive = await getPostedArchive();
  const exists = archive.some((r) => r.storyId === record.storyId);
  if (!exists) {
    archive.unshift(record);
    await fs.writeFile(ARCHIVE_FILE, JSON.stringify(archive, null, 2), 'utf-8');
  }
}

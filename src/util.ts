import * as fs from 'fs/promises';

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function readJSON<T = unknown>(file: string): Promise<T> {
  return fs.readFile(file, 'utf-8').then((data) => JSON.parse(data) as T);
}

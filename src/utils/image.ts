import { writeFile } from "fs/promises";


export async function downloadImage(url: string, path: string) {
  const response = await fetch(url);

  if (!response.ok)
    throw new Error(`Failed to downloade Image status: ${response.status}`);

  const imageData = await response.arrayBuffer();

  await writeFile(path, Buffer.from(imageData));
}
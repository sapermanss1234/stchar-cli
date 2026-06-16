import { mkdir, writeFile } from "fs/promises";
import type { CharacterPreview, SillyTavernCard } from "./types";
import { extractCharacterPreview, fetchCharacterJson } from "./khuiai";
import { interactiveOption } from "./interactive";

const args = process.argv.slice(2);
const command = args[0];
const url = args[1];
const saveJson = args.includes("--json");
const saveImage = args.includes("--image");
const locale = args.filter((item) => {
  return item.startsWith("--locale");
})[0];

async function main() {
  if (args.length === 0) {
    const option = await interactiveOption();
    await handleDownload(
      option.url,
      option.saveJson,
      option.saveImage,
      option.locale,
    );
  } else {
    if (command === "download") {
      const newlocale = locale?.split("=")[1];
      await handleDownload(url, saveJson, saveImage, newlocale);
      return;
    }

    console.log("Unknown command");
    help();
  }
}

function help() {
  console.log("Usage:");
  console.log(
    "   stchar-cli download <url> --json --image --locale={language}",
  );
}

async function handleDownload(
  url: string | undefined,
  saveJson: boolean,
  saveImage: boolean,
  locale: string | undefined,
) {
  if (!url) {
    console.log("Error not found url");
    help();
    return;
  }

  if (!locale) {
    console.log("Not found locale it gonna use default(th)");
  }

  console.log("Url detected");
  console.log(`Url: ${url}`);
  console.log(`saveJson: ${saveJson}`);
  console.log(`saveImage: ${saveImage}`);

  console.log("fetching JSON...");
  const data = await fetchCharacterJson(url, locale);
  console.log("data loaded");
  console.log(`data length: ${data.length}`);

  const PreviewCharacter = extractCharacterPreview(data, url);
  console.log("Charcter data:");
  console.log(`title: ${PreviewCharacter.title}`);
  console.log(`description: ${PreviewCharacter.description}`);
  console.log(`imageUrl: ${PreviewCharacter.imageUrl}`);
  console.log(`sourceUrl: ${PreviewCharacter.sourceUrl}`);

  const sillytavern = createSillyTavernCard(PreviewCharacter);
  const json = JSON.stringify(sillytavern, null, 2);

  if (saveJson) {
    const filename = sanitizeFilename(PreviewCharacter.title);
    await mkdir("output", { recursive: true });
    await mkdir(`output/${filename}`, { recursive: true });
    await writeFile(`output/${filename}/${filename}.json`, json, "utf-8");

    console.log("json saved");
  }

  if (saveImage) {
    if (!PreviewCharacter.imageUrl) {
      console.log("not found imageUrl");
    }

    const filename = sanitizeFilename(PreviewCharacter.title);
    const imagePath = `output/${filename}/${filename}.jpg`;

    await mkdir("output", { recursive: true });
    await mkdir(`output/${filename}`, { recursive: true });

    console.log("Downloading image...");
    await downloadImage(PreviewCharacter.imageUrl, imagePath);

    console.log(`Image saved: ${imagePath}`);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\?%*:|"<>]/g, "-").trim();
}

async function downloadImage(url: string, path: string) {
  const response = await fetch(url);

  if (!response.ok)
    throw new Error(`Failed to downloade Image status: ${response.status}`);

  const imageData = await response.arrayBuffer();

  await writeFile(path, Buffer.from(imageData));
}

function createSillyTavernCard(character: CharacterPreview): SillyTavernCard {
  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: character.title,
      description: character.description,
      personality: character.personality,
      scenario: character.scenario,
      first_mes: character.greeting,
      creator: character.creator,
      extensions: {
        sourceUrl: character.sourceUrl,
        imageUrl: character.imageUrl,
      },
    },
  };
}

await main();

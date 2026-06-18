import { mkdir, writeFile } from "fs/promises";
import type { CharacterPreview } from "./types";
import { fetchKhuiaiCharacter } from "./providers/khuiai";
import { interactiveOption } from "./interactive";
import { fetchJoyladaCharacter } from "./providers/joylada";
import { showMainMenu, showRepeat } from "./menu";
import { createSillyTavernCard } from "./converters/sillytavern";
import { sanitizeFilename } from "./utils";
import { downloadImage } from "./utils/image";

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
    while (true) {
      const menu = await showMainMenu();
      if (menu === "download") {
        const option = await interactiveOption();
        await handleDownload(
          option.url,
          option.saveJson,
          option.saveImage,
          option.locale,
        );

        switch (await showRepeat()) {
          case "back":
            continue;
          case "exit":
            process.exit(1);
        }
      } else if (menu === "exit") {
        process.exit(1);
      }
    }
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

  let PreviewCharacter: CharacterPreview;

  if (url.includes("khuiai")) {
    console.log("fetching JSON...");
    PreviewCharacter = await fetchKhuiaiCharacter(url, locale);
    console.log("data loaded");
  } else if (url.includes("joylada")) {
    console.log("fetching JSON...");
    PreviewCharacter = await fetchJoyladaCharacter(url);
    console.log("data loaded");
  } else {
    throw new Error("Unsupported provider");
  }

  console.log(PreviewCharacter);

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

await main();

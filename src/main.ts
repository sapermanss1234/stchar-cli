import {mkdir,writeFile} from "fs/promises";

const args = process.argv.slice(2);
const command = args[0];
const url = args[1];
const saveJson = args.includes("--json");
const saveImage = args.includes("--image");

type CharacterPreview = {
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
}

type SillyTavernCard = {
  spec: string;
  spec_version: string;
  data: {
    name: string;
    description: string;
    scenario: string;
    first_mes: string;
    creator: string;
    extensions: {
      sourceUrl: string;
      imageUrl: string;
    };
  };
};

async function main() {
  if (!command) {
    help();
    return;
  }

  if (command === "download") {
    await handleDownload(url, saveJson, saveImage);
    return;
  }

  console.log("Unknown command");
  help();
}

function help() {
  console.log("Usage:")
  console.log("   stchar-cli download <url> --json --image")
}

async function handleDownload(url: string | undefined, saveJson: boolean, saveImage: boolean) {
  if (!url) {
    console.log("Error not found url");
    help();
    return;
  }

  console.log("Url detected");
  console.log(`Url: ${url}`);
  console.log(`saveJson: ${saveJson}`);
  console.log(`saveImage: ${saveImage}`);

  console.log("fetching html...");
  const html = await fetchHtml(url);
  console.log("html loaded");
  console.log(`html length: ${html.length}`);

  const PreviewCharacter = extractCharacterPreview(html, url);
  console.log("Charcter data:");
  console.log(`title: ${PreviewCharacter.title}`);
  console.log(`description: ${PreviewCharacter.description}`);
  console.log(`imageUrl: ${PreviewCharacter.imageUrl}`);
  console.log(`sourceUrl: ${PreviewCharacter.sourceUrl}`);

  const sillytavern = createSillyTavernCard(PreviewCharacter);
  const json = JSON.stringify(sillytavern, null, 2);

  console.log("JSON preview:");
  console.log(json);
  console.log(html.includes("section-bio"));
  console.log("has section-bio:", html.includes("section-bio"));
  console.log("has character text:", html.includes("รินรดา"));
  console.log("has greeting text:", html.includes("ท่านประธาน"));
  
  const keyword = "รินรดา";
  const index = html.indexOf(keyword);

  console.log("keyword index:", index);

  if (index !== -1) {
    console.log(html.slice(index - 300, index + 500));
  }


  if (saveJson){
    const filename = sanitizeFilename(PreviewCharacter.title);
    await mkdir("output",{recursive:true});
    writeFile(`output/${filename}.json`,json,"utf-8");

    console.log("json saved");
  }

  if (saveImage){
    if (!PreviewCharacter.imageUrl){
      console.log("not found imageUrl")
    }

    const filename = sanitizeFilename(PreviewCharacter.title);
    const imagePath = `output/${filename}.jpg`;

    await mkdir("output", { recursive: true });

    console.log("Downloading image...");
    await downloadImage(PreviewCharacter.imageUrl, imagePath);

    console.log(`Image saved: ${imagePath}`);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\?%*:|"<>]/g, "-").trim();
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`failed to fetch url status: ${response.status}`);
  }

  const html = await response.text();
  return html;
}

function extractTitle(html: string): string {
  const match = html.match(/<title>(.*?)<\/title>/i);

  if (!match || !match[1]) {
    return "Untitled";
  }

  return match[1].trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'");
}

function extractImageUrl(html: string): string | undefined {
  const match = html.match(
    /<meta property="og:image" content="([^"]+)"/i,
  );

  if (!match) {
    return undefined;
  }

  return match[1];
}

function extractDescription(html: string): string | undefined {
  const match = html.match(
    /<meta property="og:description" content="([^"]+)"/i,
  );

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match[1]!);
}

function extractCharacterName(title: string): string {
  const parts = title.split("|");
  if (!parts || !parts[0]){
    return ""
  }
  return parts[0].trim();
}

async function downloadImage(url: string,path: string){
  const response = await fetch(url);

  if (!response.ok)
    throw new Error(`Failed to downloade Image status: ${response.status}`)

  const imageData = await response.arrayBuffer();

  writeFile(path,Buffer.from(imageData));
}

function extractCharacterPreview(html: string, sourceUrl: string): CharacterPreview {
  const title = extractTitle(html);
  const description = extractDescription(html) ?? "";
  const imageUrl = extractImageUrl(html) ?? "";
  const name = extractCharacterName(title);

  return {
    title: name,
    description,
    imageUrl,
    sourceUrl
  };
}

function createSillyTavernCard(
  character: CharacterPreview,
): SillyTavernCard {
  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: character.title,
      description: character.description,
      scenario: "",
      first_mes: "",
      creator: "",
      extensions: {
        sourceUrl: character.sourceUrl,
        imageUrl: character.imageUrl,
      },
    },
  };
}

await main();


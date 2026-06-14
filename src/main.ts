import {mkdir,writeFile} from "fs/promises";

const args = process.argv.slice(2);
const command = args[0];
const url = args[1];
const saveJson = args.includes("--json");
const saveImage = args.includes("--image");
const locale = args.filter((item) => {return item.startsWith("--locale")})[0]

type CharacterPreview = {
  title: string;
  description: string;
  personality: string;
  greeting: string;
  imageUrl: string;
  sourceUrl: string;
  scenario: string;
  creator: string;
}

type SillyTavernCard = {
  spec: string;
  spec_version: string;
  data: {
    name: string;
    description: string;
    personality: string;
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
    await handleDownload(url, saveJson, saveImage, locale);
    return;
  }

  console.log("Unknown command");
  help();
}

function help() {
  console.log("Usage:")
  console.log("   stchar-cli download <url> --json --image --locale={language}")
}

async function handleDownload(url: string | undefined, saveJson: boolean, saveImage: boolean, locale: string | undefined) {
  if (!url) {
    console.log("Error not found url");
    help();
    return;
  }

  if (!locale) {
    console.log("Not found locale it gonna use default(th)")
  }

  console.log("Url detected");
  console.log(`Url: ${url}`);
  console.log(`saveJson: ${saveJson}`);
  console.log(`saveImage: ${saveImage}`);

  console.log("fetching html...");
  const html = await fetchCharacterJson(url,locale);
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

  if (saveJson){
    const filename = sanitizeFilename(PreviewCharacter.title);
    await mkdir("output",{recursive:true});
    await mkdir(`output/${filename}`, {recursive:true})
    await writeFile(`output/${filename}/${filename}.json`,json,"utf-8");

    console.log("json saved");
  }

  if (saveImage){
    if (!PreviewCharacter.imageUrl){
      console.log("not found imageUrl")
    }

    const filename = sanitizeFilename(PreviewCharacter.title);
    const imagePath = `output/${filename}/${filename}.jpg`;

    await mkdir("output", { recursive: true });
    await mkdir(`output/${filename}`, {recursive:true})

    console.log("Downloading image...");
    await downloadImage(PreviewCharacter.imageUrl, imagePath);

    console.log(`Image saved: ${imagePath}`);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\?%*:|"<>]/g, "-").trim();
}

async function fetchCharacterJson(url: string, locale: string | undefined): Promise<string> {
  const api = 'https://khuiai-backend-865395639088.asia-southeast1.run.app/api/v1/characters/'
  let response = await fetch(api+url.split('/')[url.split('/').length-1]+"?locale="+locale?.split('=')[1]);
  if (!locale){
    response = await fetch(api+url.split('/')[url.split('/').length-1]);
  }

  if (!response.ok) {
    throw new Error(`failed to fetch url status: ${response.status}`);
  }

  const JsonString = await response.text();

  return JsonString;
  
}

function extractTitle(html: string): string {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.name.split('|')[0];
  if (!match) {
    return "Untitled";
  }

  return match;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'")
}

function extractImageUrl(html: string): string | undefined {
  const JsonObj = JSON.parse(html)
  const match = JsonObj.data.image;

  if (!match) {
    return undefined;
  }

  return match;
}

function extractGreeting(html: string): string | undefined {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.greeting;

  if(!match) {
    return undefined 
  }

  return decodeHtmlEntities(match);
}

function extractPersonality(html: string): string | undefined {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.bio;

  if(!match) {
    return undefined
  }

  return decodeHtmlEntities(match);
}

function extractDescription(html: string): string | undefined {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.tagline;

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match);
}

function extractScenario(html: string): string | undefined {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.defaultSituationId.situationDetail

  if (!match) {
    return undefined
  }

  return decodeHtmlEntities(match);
}

function extractCreator(html: string): string | undefined {
  const JsonObj = JSON.parse(html);
  const match = JsonObj.data.creator.username

  if (!match) {
    return undefined
  }

  return match
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

  await writeFile(path,Buffer.from(imageData));
}

function extractCharacterPreview(html: string, sourceUrl: string): CharacterPreview {
  const title = extractTitle(html);
  const description = extractDescription(html) ?? "";
  const imageUrl = extractImageUrl(html) ?? "";
  const name = extractCharacterName(title);
  const greeting = extractGreeting(html) ?? "";
  const personality = extractPersonality(html) ?? "";
  const scenario = extractScenario(html) ?? "";
  const creator = extractCreator(html) ?? "";

  return {
    title: name,
    description,
    personality,
    imageUrl,
    sourceUrl,
    greeting,
    scenario,
    creator
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


import type { CharacterPreview } from "../types";

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'");
}

export async function fetchKhuiaiCharacter(
  url: string,
  locale: string | undefined,
): Promise<string> {
  const api =
    "https://khuiai-backend-865395639088.asia-southeast1.run.app/api/v1/characters/";
  let response = await fetch(
    api + url.split("/")[url.split("/").length - 1] + "?locale=" + locale,
  );
  if (!locale) {
    response = await fetch(api + url.split("/")[url.split("/").length - 1]);
  }

  if (!response.ok) {
    throw new Error(`failed to fetch url status: ${response.status}`);
  }

  const JsonString = await response.text();

  return JsonString;
}

function extractTitle(jsonObj: any): string {
  const match = jsonObj.data.name.split("|")[0];
  if (!match) {
    return "Untitled";
  }

  return match;
}

function extractImageUrl(jsonObj: any): string | undefined {
  const match = jsonObj.data.image;

  if (!match) {
    return undefined;
  }

  return match;
}

function extractGreeting(jsonObj: any): string | undefined {
  const match = jsonObj.data.greeting;

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match);
}

function extractPersonality(jsonObj: any): string | undefined {
  const match = jsonObj.data.bio;

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match);
}

function extractDescription(jsonObj: any): string | undefined {
  const match = jsonObj.data.tagline;

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match);
}

function extractScenario(jsonObj: any): string | undefined {
  const match = jsonObj.data.defaultSituationId.situationDetail;

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities(match);
}

function extractCreator(jsonObj: any): string | undefined {
  const match = jsonObj.data.creator.username;

  if (!match) {
    return undefined;
  }

  return match;
}

function extractCharacterName(title: string): string {
  const parts = title.split("|");
  if (!parts || !parts[0]) {
    return "";
  }
  return parts[0].trim();
}

export function extractCharacterPreview(
  jsonString: string,
  sourceUrl: string,
): CharacterPreview {
  const jsonObj = JSON.parse(jsonString);
  const title = extractTitle(jsonObj);
  const description = extractDescription(jsonObj) ?? "";
  const imageUrl = extractImageUrl(jsonObj) ?? "";
  const name = extractCharacterName(title);
  const greeting = extractGreeting(jsonObj) ?? "";
  const personality = extractPersonality(jsonObj) ?? "";
  const scenario = extractScenario(jsonObj) ?? "";
  const creator = extractCreator(jsonObj) ?? "";

  return {
    title: name,
    description,
    personality,
    imageUrl,
    sourceUrl,
    greeting,
    scenario,
    creator,
  };
}

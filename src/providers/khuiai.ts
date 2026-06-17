import type { CharacterPreview } from "../types";

export async function fetchKhuiaiCharacter(
  url: string,
  locale?: string,
): Promise<CharacterPreview> {
  const api = `https://khuiai-backend-865395639088.asia-southeast1.run.app/api/v1/characters/${url.split("/").pop()}`;

  let response;
  if (locale) {
    response = await fetch(`${api}?locale=${locale}`);
  } else {
    response = await fetch(`${api}`);
  }

  if (!response.ok) {
    throw new Error(`failed to fetch url status: ${response.status}`);
  }

  const JsonObj = (await response.json()) as any;

  return {
    title: JsonObj.data.name.split("|")[0].trim(),
    description: JsonObj.data.tagline,
    imageUrl: JsonObj.data.image ?? "",
    personality: JsonObj.data.bio,
    scenario: JsonObj.data.defaultSituationId?.situationDetail ?? "",
    creator: JsonObj.data.creator?.username ?? "",
    sourceUrl: url,
    greeting: JsonObj.data.greeting,
  };
}

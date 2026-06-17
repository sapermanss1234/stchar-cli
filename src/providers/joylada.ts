import type { CharacterPreview } from "../types";

export async function fetchJoyladaCharacter(
  url: string,
): Promise<CharacterPreview> {
  const id = url.split("/").pop();
  const response = await fetch(
    `https://character-api.joylada.io/api/characters/${id}`,
  );
  if (!response.ok) {
    throw new Error(`failed to fetch url status: ${response.status}`);
  }

  const JsonObj = await response.json() as any;

  return {
    title: JsonObj.name,
    description: JsonObj.tagline,
    imageUrl: JsonObj.imageUrl,
    personality: JsonObj.bio,
    scenario:JsonObj.defaultScene.description ?? "",
    creator: JsonObj.creator.name ?? "",
    sourceUrl:url,
    greeting:""
  };
}

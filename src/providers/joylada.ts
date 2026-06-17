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

  const JsonObj = (await response.json()) as any;

  return {
    title: JsonObj.name,
    description: JsonObj.tagline,
    imageUrl: JsonObj.imageUrl,
    personality: JsonObj.bio,
    scenario: JsonObj.defaultScene?.description ?? "",
    creator: JsonObj.creator?.name ?? "",
    sourceUrl: url,
    greeting: await fetchGreeting(JsonObj.id, JsonObj.name),
  };
}

async function fetchGreeting(
  characterId: string,
  title: string,
): Promise<string> {
  const response = await fetch("https://character-api.joylada.io/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      characterId,
      title,
      image: {
        sourceId: characterId,
        sourceType: "character",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`failed to create chat status: ${response.status}`);
  }
  const json = (await response.json()) as any;
  return json.lastMessage?.content ?? "";
}

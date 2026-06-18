import type { SillyTavernCard, CharacterPreview } from "../types";

export function createSillyTavernCard(
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

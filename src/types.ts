export type CharacterPreview = {
  title: string;
  description: string;
  personality: string;
  greeting: string;
  imageUrl: string;
  sourceUrl: string;
  scenario: string;
  creator: string;
};

export type SillyTavernCard = {
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

export type Screen = "menu" | "download" | "setting";

export interface Config {
  saveJson: boolean;
  saveImage: boolean;
  locale: string;
}

export interface ScreenProps {
  setScreen: (screen: Screen) => void;
}

export interface SettingProps extends ScreenProps {
  config: Config;
  setConfig: (config: Config) => void;
}

export interface DownloadProps extends ScreenProps {
  config: Config;
}
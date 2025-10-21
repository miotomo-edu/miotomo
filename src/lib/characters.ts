export type Character = {
  name: string;
  icon: string;
  bg: string;
  customBg?: string;
  modality: string;
  x: number;
  prompt: string;
  disabled?: boolean;
  voice?: string;
  modalities?: string;
  images?: {
    idle: string;
    sleeping?: string;
    listening?: string;
  };
};

import miotomoAvatar from "../assets/img/characters/cat.svg";
import sparkoAvatar from "../assets/img/characters/octopus.svg";
import sparkoListeningAvatar from "../assets/img/characters/octopus_listening.svg";
import sparkoSleepingAvatar from "../assets/img/characters/octopus_sleep.svg";
import arguAvatar from "../assets/img/characters/fox.svg";
import wordieAvatar from "../assets/img/characters/panda.svg";
import fizzAvatar from "../assets/img/fizz-avatar.png";
import echoAvatar from "../assets/img/characters/parrot.svg";

export const characterData: Character[] = [
  {
    name: "Tomo",
    icon: miotomoAvatar,
    images: {
      idle: miotomoAvatar,
      sleeping: miotomoAvatar,
      listening: miotomoAvatar,
    },
    bg: "bg-purple-200",
    modality: "Wise companion",
    x: 30,
    prompt: "storytelling",
    modalities: "storytelling",
  },
  {
    name: "Sparko",
    icon: sparkoAvatar,
    images: {
      idle: sparkoAvatar,
      sleeping: sparkoSleepingAvatar,
      listening: sparkoListeningAvatar,
    },
    bg: "bg-yellow-200",
    modality: "Spelling",
    x: 50,
    prompt: "spelling",
    voice: "aura-2-callista-en",
    disabled: false,
    modalities: "spelling",
  },
  {
    name: "Argoo",
    icon: arguAvatar,
    images: {
      idle: arguAvatar,
      sleeping: arguAvatar,
      listening: arguAvatar,
    },
    bg: "",
    customBg: "#C6DDAF",
    modality: "Little debater",
    x: 70,
    prompt: "debating",
    modalities: "debating",
    voice: "aura-2-asteria-en",
  },
  {
    name: "Wordie",
    icon: wordieAvatar,
    images: {
      idle: wordieAvatar,
      sleeping: wordieAvatar,
      listening: wordieAvatar,
    },
    bg: "bg-green-200",
    modality: "Word wizard",
    x: 40,
    prompt: "vocabulary",
    modalities: "vocabulary",
    voice: "aura-2-ophelia-en",
  },
  {
    name: "Fizz",
    icon: fizzAvatar,
    images: {
      idle: fizzAvatar,
      sleeping: fizzAvatar,
      listening: fizzAvatar,
    },
    bg: "bg-orange-200",
    modality: "Story booster",
    x: 65,
    prompt: "game",
    voice: "aura-2-luna-en",
  },
  {
    name: "Echo",
    icon: echoAvatar,
    images: {
      idle: echoAvatar,
      sleeping: echoAvatar,
      listening: echoAvatar,
    },
    bg: "bg-pink-200",
    modality: "Story twist",
    x: 50,
    prompt: "storytelling",
    disabled: true,
  },
];

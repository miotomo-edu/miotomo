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
import miotomoSleepingAvatar from "../assets/img/characters/cat_sleeping.svg";
import miotomoListeningAvatar from "../assets/img/characters/cat_listening.svg";

import sparkoAvatar from "../assets/img/characters/octopus.svg";
import sparkoListeningAvatar from "../assets/img/characters/octopus_listening.svg";
import sparkoSleepingAvatar from "../assets/img/characters/octopus_sleeping.svg";

import arguAvatar from "../assets/img/characters/fox.svg";
import arguSleepingAvatar from "../assets/img/characters/fox_sleeping.svg";

import wordieAvatar from "../assets/img/characters/panda.svg";
import wordieSleepingAvatar from "../assets/img/characters/panda_sleeping.svg";

import fizzAvatar from "../assets/img/fizz-avatar.png";

import echoAvatar from "../assets/img/characters/parrot.svg";
import echoSleepingAvatar from "../assets/img/characters/parrot_sleeping.svg";

export const characterData: Character[] = [
  {
    name: "Tomo",
    icon: miotomoAvatar,
    images: {
      idle: miotomoAvatar,
      sleeping: miotomoSleepingAvatar,
      listening: miotomoListeningAvatar,
    },
    bg: "",
    customBg: "#F2D47C",
    modality: "Wise companion",
    x: 30,
    prompt: "storytelling",
    modalities: "storytelling",
  },
  {
    name: "Gigi",
    icon: sparkoAvatar,
    images: {
      idle: sparkoAvatar,
      sleeping: sparkoSleepingAvatar,
      listening: sparkoListeningAvatar,
    },
    bg: "",
    customBg: "#92B1D1",
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
      sleeping: arguSleepingAvatar,
      listening: arguAvatar,
    },
    bg: "",
    customBg: "#E49C88",
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
      sleeping: wordieSleepingAvatar,
      listening: wordieAvatar,
    },
    bg: "",
    customBg: "#92949E",
    modality: "Word wizard",
    x: 40,
    prompt: "vocabulary",
    modalities: "vocabulary",
    voice: "aura-2-ophelia-en",
  },
  // {
  //   name: "Fizz",
  //   icon: fizzAvatar,
  //   images: {
  //     idle: fizzAvatar,
  //     sleeping: fizzAvatar,
  //     listening: fizzAvatar,
  //   },
  //   bg: "",
  //   customBg: "#C6DDAF",
  //   modality: "Story booster",
  //   x: 65,
  //   prompt: "game",
  //   voice: "aura-2-luna-en",
  // },
  {
    name: "Echo",
    icon: echoAvatar,
    images: {
      idle: echoAvatar,
      sleeping: echoSleepingAvatar,
      listening: echoAvatar,
    },
    bg: "",
    customBg: "#97BBA0",
    modality: "Story twist",
    x: 50,
    prompt: "storytelling",
    disabled: true,
  },
];

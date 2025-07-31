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
};

import miotomoAvatar from "../assets/img/miotomo-avatar.png";
import sparkoAvatar from "../assets/img/sparko-avatar.png";
import arguAvatar from "../assets/img/argu-avatar.png";
import wordieAvatar from "../assets/img/wordie-avatar.png";
import fizzAvatar from "../assets/img/fizz-avatar.png";
import echoAvatar from "../assets/img/echo-avatar.png";

export const characterData: Character[] = [
  {
    name: "Miotomo",
    icon: miotomoAvatar,
    bg: "bg-purple-200",
    modality: "Wise companion",
    x: 30,
    prompt: "storytelling",
  },
  {
    name: "Sparko",
    icon: sparkoAvatar,
    bg: "bg-yellow-200",
    modality: "Spelling champ",
    x: 50,
    prompt: "spelling",
    voice: "aura-2-hyperion-en",
  },
  {
    name: "Argoo",
    icon: arguAvatar,
    bg: "",
    customBg: "#C6DDAF",
    modality: "Little debater",
    x: 70,
    prompt: "debating",
    voice: "aura-2-vesta-en",
  },
  {
    name: "Wordie",
    icon: wordieAvatar,
    bg: "bg-green-200",
    modality: "Word wizard",
    x: 40,
    prompt: "vocabulary",
    voice: "aura-2-ophelia-en",
  },
  {
    name: "Fizz",
    icon: fizzAvatar,
    bg: "bg-orange-200",
    modality: "Story booster",
    x: 65,
    prompt: "game",
    voice: "aura-2-luna-en",
  },
  {
    name: "Echo",
    icon: echoAvatar,
    bg: "bg-pink-200",
    modality: "Coming soon...",
    x: 50,
    prompt: "storytelling",
    disabled: true,
  },
];

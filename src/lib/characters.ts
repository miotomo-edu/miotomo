export type Character = {
  name: string;
  icon: string;
  bg: string;
  customBg?: string;
  modality: string;
  x: number;
  prompt: string;
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
  },
  {
    name: "Argoo",
    icon: arguAvatar,
    bg: "",
    customBg: "#C6DDAF",
    modality: "Little debater",
    x: 70,
    prompt: "debating",
  },
  {
    name: "Wordie",
    icon: wordieAvatar,
    bg: "bg-green-200",
    modality: "Word wizard",
    x: 40,
    prompt: "vocabulary",
  },
  {
    name: "Fizz",
    icon: fizzAvatar,
    bg: "bg-orange-200",
    modality: "Story booster",
    x: 65,
    prompt: "game",
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

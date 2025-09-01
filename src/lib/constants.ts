import { type StsConfig, type Voice } from "../utils/deepgramUtils";
import { loadBookCompanionPrompt, bookCompanionGreetings } from "./prompts";

export const stsConfig: StsConfig = {
  type: "Settings",
  experimental: false,
  mip_opt_out: false,
  audio: {
    input: {
      encoding: "linear16",
      sample_rate: 16000,
    },
    output: {
      encoding: "linear16",
      sample_rate: 24000,
      container: "none",
    },
  },
  agent: {
    language: "en",
    listen: {
      provider: {
        type: "deepgram",
        model: "nova-3-general",
        // endpointing: 1500,
      },
    },
    think: {
      provider: {
        type: "open_ai",
        model: "gpt-4o-mini",
        temperature: 0,
      },
      prompt: "",
      functions: [
        {
          name: "get_weather",
          description: "Get the current weather for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city or location to get weather for",
              },
            },
            required: ["location"],
          },
        },
      ],
    },
    speak: {
      provider: {
        type: "deepgram",
        model: "aura-2-thalia-en",
      },
    },
    // "speak": {
    //   "provider": {
    //     "type": "eleven_labs",
    //     "model_id": "eleven_multilingual_v2",
    //     // "language_code": "en-EN"
    //   },
    //   "endpoint": {
    //     "url": "https://api.elevenlabs.io/v2/text-to-speech",
    //     "headers": {
    //       "xi-api-key": "sk_7640198eca4c2340a57d0c306b5efb6842786d934b26e47f"
    //     }
    //   }
    // },
    greeting: bookCompanionGreetings,
  },
};

export const getWeather = async (location: string): Promise<string | null> => {
  return `The current weather in ${location} is sunny with a temperature of 31°.`;
};

type NonEmptyArray<T> = [T, ...T[]];
export const availableVoices: Voice[] = [
  {
    name: "Thalia",
    canonical_name: "aura-2-thalia-en",
    provider: {
      type: "deepgram",
      model: "aura-2-thalia-en",
    },
    metadata: {
      accent: "American",
      gender: "female",
      image: "/voices/thalia.png",
      color: "#FF6B6B",
      sample: "/samples/thalia.mp3",
    },
  },
  {
    name: "Nova",
    canonical_name: "nova-3-medical",
    provider: {
      type: "deepgram",
      model: "nova-3-medical",
    },
    metadata: {
      accent: "American",
      gender: "female",
      image: "/voices/nova.png",
      color: "#4ECDC4",
      sample: "/samples/nova.mp3",
    },
  },
  {
    name: "Eleven",
    canonical_name: "eleven-english-v1",
    provider: {
      type: "elevenlabs",
      model: "eleven-english-v1",
    },
    metadata: {
      accent: "American",
      gender: "female",
      image: "/voices/eleven.png",
      color: "#45B7D1",
      sample: "/samples/eleven.mp3",
    },
  },
];
export const defaultVoice: Voice = availableVoices[0]!;

export const sharedOpenGraphMetadata = {
  title: "Voice Agent | Deepgram",
  type: "website",
  url: "/",
  description: "Meet Deepgram's Voice Agent API",
};

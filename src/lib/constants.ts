import { loadBookCompanionPrompt, bookCompanionGreetings } from "./prompts";

export const stsConfig = {
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

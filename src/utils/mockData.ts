// Development flag to enable/disable mock data
export const USE_MOCK_DATA = false; // Set to false when you want to use real data

// Fake conversation messages for development without requiring TypeScript types
export const mockMessages = [
  { user: "Hello, I'm feeling sick today. I have a sore throat and fever." },
  {
    assistant:
      "I'm sorry to hear that. Can you tell me when these symptoms started?",
  },
  { user: "They started about 2 days ago." },
  {
    assistant:
      "Do you have any other symptoms like cough, difficulty breathing, or body aches?",
  },
  { user: "Yes, I have a mild cough and body aches." },
  {
    assistant:
      "Thank you for sharing that information. Based on your symptoms, it sounds like you might have a viral infection, possibly the flu. I recommend rest, plenty of fluids, and over-the-counter pain relievers for the fever and body aches. If your symptoms worsen or don't improve in a few days, please consider seeing a doctor.",
  },
  {
    assistant:
      "I'm sorry to hear that. Can you tell me when these symptoms started?",
  },
  { user: "They started about 2 days ago." },
  {
    assistant:
      "Do you have any other symptoms like cough, difficulty breathing, or body aches?",
  },
  { user: "Yes, I have a mild cough and body aches." },
  {
    assistant:
      "Thank you for sharing that information. Based on your symptoms, it sounds like you might have a viral infection, possibly the flu. I recommend rest, plenty of fluids, and over-the-counter pain relievers for the fever and body aches. If your symptoms worsen or don't improve in a few days, please consider seeing a doctor.",
  },
];

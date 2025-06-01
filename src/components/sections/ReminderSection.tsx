import React from "react";
import { BulbIcon } from "../common/icons/BulbIcon";
import { StarIcon } from "../common/icons/StarIcon";
import { BubbleIcon } from "../common/icons/BubbleIcon";
import { VocabularyIcon } from "../common/icons/VocabularyIcon";

const reminders = [
  {
    text: "Give longer answers and explain your thinking more",
    color: "#F78AD7",
    icon: <StarIcon />,
  },
  {
    text: "Summarize longer sections without leaving details.",
    color: "#6EC1E4",
    icon: <BulbIcon />,
  },
  {
    text: "Share unpopular opinions during debates without hesitation",
    color: "#00008B",
    icon: <BubbleIcon />,
  },
  {
    text: "Use more specific vocabulary when describing characters's feelings",
    color: "#8BC34A",
    icon: <VocabularyIcon />,
  },
];

const ReminderSection: React.FC = () => (
  <section className="py-6 px-4">
    <h2 className="text-2xl font-bold mb-4">A useful reminder from Miotomo</h2>
    <ul className="space-y-3">
      {reminders.map((reminder, idx) => (
        <li key={idx} className="flex items-center">
          <span
            style={{ color: reminder.color, fontSize: 24, marginRight: 12 }}
          >
            {React.cloneElement(reminder.icon, {
              style: { color: reminder.color, fontSize: 24 },
            })}
          </span>
          <span className="text-base">{reminder.text}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default ReminderSection;

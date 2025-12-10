// WelcomeSection.tsx
import React from "react";
import userAvatar from "../../assets/img/user-avatar.png";

const AVATAR_SIZE = 64; // px

interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => (
  <section className="py-6 px-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={userAvatar}
          alt="Avatar"
          className="object-cover"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        />
        <div className="ml-4 flex flex-col justify-center">
          <h1 className="text-3xl font-bold">Hi, {userName}!</h1>
          <span className="text-base">Level 8 Reader</span>
        </div>
      </div>
    </div>
  </section>
);

export default WelcomeSection;

// WelcomeSection.tsx
import React from "react";
import userAvatar from "../../assets/img/user-avatar.png";

const AVATAR_SIZE = 44; // px

interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => (
  <section className="pb-4 pt-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={userAvatar}
            alt="Avatar"
            className="rounded-full object-cover ring-4 ring-brand-primary/60"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold leading-none md:text-5xl">
            {userName}
          </h1>
        </div>
      </div>
    </div>
  </section>
);

export default WelcomeSection;

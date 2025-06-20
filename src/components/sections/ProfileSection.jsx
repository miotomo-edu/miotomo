import React, { useState } from "react";
import progressImg from "../../assets/img/progress.png";
import progressWeekImg from "../../assets/img/progress-week.png";

const ProfileSection = () => {
  const [showWeeklyProgress, setShowWeeklyProgress] = useState(false);

  const toggleProgress = () => {
    setShowWeeklyProgress(!showWeeklyProgress);
  };

  return (
    <div className="w-full h-full cursor-pointer" onClick={toggleProgress}>
      {showWeeklyProgress ? (
        <img
          src={progressWeekImg}
          alt="Your Weekly Progress"
          className="w-full h-auto m-0 p-0 rounded-none"
          style={{ display: "block" }}
        />
      ) : (
        <img
          src={progressImg}
          alt="Your Progress"
          className="w-full h-auto m-0 p-0 rounded-none"
          style={{ display: "block" }}
        />
      )}
    </div>
  );
};

export default ProfileSection;

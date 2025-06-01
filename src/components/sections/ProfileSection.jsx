import React from "react";
import progressImg from "../../assets/img/progress.png";

const ProfileSection = () => {
  return (
    <div className="w-full h-full">
      <img
        src={progressImg}
        alt="Your Progress"
        className="w-full h-auto m-0 p-0 rounded-none"
        style={{ display: "block" }}
      />
    </div>
  );
};

export default ProfileSection;

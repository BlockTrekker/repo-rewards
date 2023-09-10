import React from "react";
import ProjectInfo from "./ProjectInfo";

const Hero = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Repo Rewards</h1>
          <p className="py-6">
            Fund contributors and maintainers of open source projects you use!
          </p>
          <ProjectInfo />
        </div>
      </div>
    </div>
  );
};

export default Hero;

import React from "react";

const ProjectInfo = () => {
  return (
    <form>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Start Date"
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="End Date"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Repo Name"
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Repo Owner"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <button className="btn btn-primary">Get Started</button>
    </form>
  );
};

export default ProjectInfo;

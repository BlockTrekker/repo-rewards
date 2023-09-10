import React from "react";

const ProjectInfo = ({ startCampaign }: { startCampaign: any }) => {
  return (
    <>
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
      </form>
      <button onClick={startCampaign} className="btn btn-primary">
        Get Started
      </button>
    </>
  );
};

export default ProjectInfo;

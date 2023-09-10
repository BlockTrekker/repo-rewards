"use client";
import Hero from "@/components/Hero";
import {
  close_campaign,
  processCommitsAndInsertToDB,
  updateAddressAndVerification,
} from "./libs/dbConnection";
import { useState } from "react";
import ProjectTable from "@/components/ProjectTable";
import ProjectInfo from "@/components/ProjectInfo";

export default function Home() {
  const [data, setData] = useState<null | {}>(null);
  const startCampaign = async () => {
    const response = await processCommitsAndInsertToDB(
      "duneanalytics",
      "spellbook",
      "2023-08-01T00:00:00Z",
      "2023-09-09T00:00:00Z",
      "0xtest_owner",
    );
    console.log("starting a campaign response");
    console.log("respoonse", response);
    if (response) {
      setData(response);
      console.log("data", data);
    }
    console.log(response);
  };

  const execute_update = async () => {
    const response = await updateAddressAndVerification(
      "chef-seaweed",
      "0xethaddress",
      "fd2e8d0f-c73b-42ec-82af-6a37cd436a4c",
    );
    console.log(response);
  };

  const execute_end_campaign = async () => {
    const response = await close_campaign(
      "fd2e8d0f-c73b-42ec-82af-6a37cd436a4c",
      "0xtest_owner",
    );
    console.log(response);
  };
  return (
    <main className="bg-base-200">
      {!data && <Hero startCampaign={startCampaign} />}
      {data && (
        <div className="container mx-auto py-10 ">
          <ProjectTable tableData={data} />
        </div>
      )}
      {/* TODO: About Section */}
    </main>
  );
}

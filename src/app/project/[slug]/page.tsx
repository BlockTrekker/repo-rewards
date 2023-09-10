import ProjectTable from "@/components/ProjectTable";
import Link from "next/link";
import React from "react";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto flex flex-col items-center gap-6 h-screen">
      <div className="text-center mb-6">
        <h1 className="text-xl">My Post: {params.slug}</h1>
        <p>Unique Contributors:</p>
        <p>Total Commits:</p>
      </div>
      <ProjectTable />
      <div className="flex">
        <button className="btn btn-primary">Add Contributor</button>
      </div>
    </div>
  );
}

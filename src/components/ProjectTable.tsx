"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";

type Person = {
  userName: string;

  age: number;
  verified: boolean;
};

type Campaign = {
  address: string;
  campaign_id: string;
  gh_user_name: string;
  num_commitments: number;
  repo_name: string;
  repo_owner: string;
  uuid: string;
  verified: boolean;
  votes: number;
};

const columnHelper = createColumnHelper<Campaign>();

const columns = [
  columnHelper.accessor((row) => row.gh_user_name, {
    id: "gh_user_name",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => "GitHub Username",
  }),
  columnHelper.accessor((row) => row.num_commitments, {
    id: "num_commitments",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Age</span>,
  }),
  columnHelper.accessor((row) => row.verified, {
    id: "verified",
    cell: (info) => (
      <i>{info.getValue() ? <BiCheckCircle /> : <BiXCircle />}</i>
    ),
    header: () => <span>Verified</span>,
  }),
];

const ProjectTable = ({ tableData }: { tableData: any }) => {
  console.log("table data", tableData);
  const [data, setData] = React.useState(() => [...tableData]);
  const rerender = React.useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="card w-full bg-base-300 shadow-xl">
      <div className="card-body">
        <table className="table-auto border-collapse w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                className="text-sm font-medium text-gray-400 text-left"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <th className="px-4 py-2 bg-gray-20" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm font-normal text-gray-300">
            {table.getRowModel().rows.map((row) => (
              <tr
                className="hover:bg-gray-600 border-b border-gray-700 py-10"
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="px-4 py-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;

"use client";
import Link from "next/link";
import React from "react";
import { BiArrowBack } from "react-icons/bi";
import { useSession } from "next-auth/react";
import { Web3Button } from "@web3modal/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <div className="navbar bg-base-100 mb-4 flex justify-between">
      <Link href="/" className="btn btn-ghost normal-case text-xl">
        <BiArrowBack />
      </Link>
      <div className="flex gap-2">
        {!session && (
          <Link href="/api/auth/signin" className="btn btn-primary">
            Sign in to Check Eligibility
          </Link>
        )}
        {session && <Web3Button />}
        <p className="mr-4">Repo Rewards</p>
      </div>
    </div>
  );
};

export default Navbar;

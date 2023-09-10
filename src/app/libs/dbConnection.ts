// Import the modules
import { Octokit } from "@octokit/rest";
import {supabaseClient} from "./supabase";
import { json } from "stream/consumers";
// const { Octokit } = require("@octokit/rest");
// const supabasePackage = require("@supabase/supabase-js");
// const dotenv = require("dotenv");

// Create a type for CommitData (replace 'any' with the actual type if you know it)
type CommitData = any; 

// Define a type for SupabaseClient based on its constructor
// type SupabaseClient = InstanceType<typeof supabasePackage.SupabaseClient>;

// Define your Octokit interface
interface MyOctokit {
  // Add the properties and methods you plan to use
  rest: {
    repos: {
      listCommits: any, // Replace with the actual type if you know it
    },
  },
  paginate: {
    iterator: any, // Replace with the actual type if you know it
  },
}

const fetchAllCommits = async (
  owner: string,
  repo: string,
  since: string,
  until: string
): Promise<CommitData[] | null> => {
  let commitData: CommitData[] = [];
  const octokit = new Octokit({ auth: process.env.GITHUB_AUTH_TOKEN });
  try {
    for await (const response of octokit.paginate.iterator(
      octokit.rest.repos.listCommits,
      { owner, repo, since, until }
    )) {
      commitData = [...commitData, ...response.data];
    }
    return commitData;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return null;
  }
};

export const processCommitsAndInsertToDB = async (
  owner: string,
  repo: string,
  start: string,
  end: string,
  campaign_owner: string,
): Promise<void> => {
  const commits = await fetchAllCommits( owner, repo, start, end);
  if (commits) {
    const commitCounts: Record<string, number> = {};
    commits.forEach(commit => {
      const authorLogin = commit.author ? commit.author.login : 'Unknown';
      if (!commitCounts[authorLogin]) {
        commitCounts[authorLogin] = 0;
      }
      commitCounts[authorLogin]++;
    });

    const campaign_rows = {
      repo_name: repo,
      repo_owner: owner,
      start: start,
      end: end,
      campaign_owner: campaign_owner, 
      open: true
    };

    let campaign_id: string | null = null; // Initialize campaign_id

    try {
      const { status, data, error } = await supabaseClient
        .from('campaigns')
        .insert(campaign_rows)
        .select();
      
      if (error) {
          console.error('Supabase returned an error:', JSON.stringify(error));
          return;
        }

      if (data && data.length > 0) {
        campaign_id = data[0].ucid; 
      }

      if (status === 201) {
        console.log('Successfully created a new campaign');
      }

    } catch (err) {
      console.error('Full Error inserting into Supabase:', JSON.stringify(err, null, 2));
      return; // Exit the function if there is an error
    }
 

  const airdrop_rows = Object.entries(commitCounts).map(([gh_user_name, num_commitments]) => ({
      gh_user_name,
      num_commitments,
      address: null,
      verified: false,
      repo_name: repo,
      repo_owner: owner,
      campaign_id: campaign_id
    }));
    
    console.log(airdrop_rows);

    try {
      const { status, error } = await supabaseClient
        .from('airdrop_recipients')
        .insert(airdrop_rows);
        //@ts-ignore
        if (status === 201) {
          console.log('Successfully created a new airdrop');
        }
        } catch (err) {
      console.error('Error inserting into Supabase:', err);
    }
  }
};

export const updateAddressAndVerification = async (
  gh_user_name: string,
  address: string,
  verified: boolean
): Promise<any> => {
  try {
    const { status, data, error } = await supabaseClient
      .from('airdrop_recipients')
      .update({
        address,
        verified
      })
      .eq('gh_user_name', gh_user_name);
    
    if (status === 204) {
      return "The record was updated successfully";
    } else {
      return "There was an error updating the record" + status;
    }

  } catch (err) {
    console.error('Error:', err);
  }
};

export const close_campaign = async (
  cuid: string,
  owner: string,
): Promise<any> => {
  try {
    const { status, error } = await supabaseClient
      .from('campaigns')
      .update({ open: false }) // Set the "open" field to false
      .eq('ucid', cuid) // Match the campaign's cuid
      .eq('campaign_owner', owner); // Match the campaign's owner
  
    if (error) {
      console.error('Failed to close campaign:', error);
      return null; // or throw an error, or return a more detailed error object
    }
    
    return status; // Return the updated campaign data

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return null; // or throw an error, or return a more detailed error object
  }
};

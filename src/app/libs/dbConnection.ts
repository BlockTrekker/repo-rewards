// Import the modules
import { Octokit } from "@octokit/rest";
import {supabaseClient} from "./supabase";
import { json } from "stream/consumers";
import { userAgent } from "next/server";
import Web3 from 'web3';


// Create a type for CommitData (replace 'any' with the actual type if you know it)
type CommitData = any; 

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
): Promise<any> => {
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
      const { data, status, error } = await supabaseClient
        .from('airdrop_recipients')
        .insert(airdrop_rows)
        .select();
        //@ts-ignore
        if (status === 201) {
          console.log('Successfully created a new airdrop');
          return data;
        }
        } catch (err) {
      console.error('Error inserting into Supabase:', err);
    }
  }
};

export const updateAddressAndVerification = async (
  gh_user_name: string,
  address: string,
  campaign_id: string,
): Promise<any> => {

  // First, fetch the existing record to get the current value of 'num_commitments'
  const { data: existingData, error: fetchError } = await supabaseClient
    .from('airdrop_recipients')
    .select('num_commitments')
    .eq('gh_user_name', gh_user_name)
    .eq('campaign_id', campaign_id)
    .limit(1);  
  
  if (fetchError) {
    console.error('Error fetching record:', fetchError);
    return;
  }

  // If no matching record is found, you might want to handle that case here
  if (!existingData || existingData.length === 0) {
    console.error('No matching record found');
    return;
  }

  const num_commitments = existingData[0].num_commitments;

  try {
    const { status, data, error } = await supabaseClient
      .from('airdrop_recipients')
      .update({
        address: address,
        verified: true,
        votes: num_commitments * 10
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

// export const airdrop_gov_token = async (campaignId: string, fromAddress: string): Promise<any> => {
//   const abi = require('./abi.json');
//   const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//   const contract = new web3.eth.Contract(abi, '0x5DcE1044A7E2E35D6524001796cee47252f18411');
  
//   try {
//     type FormData = {
//       daoName: string | null;
//       tokenName: string | null;
//       tokenSymbol: string;
//       lootTokenName: string;
//       lootTokenSymbol: string;
//       votingTransferable: boolean;
//       nvTransferable: boolean;
//       quorum: number;
//       minRetention: number;
//       sponsorThreshold: number;
//       newOffering: number;
//       votingPeriodInSeconds: number;
//       gracePeriodInSeconds: number;
//       shamans: any | null;
//       members: any[][];
//     };

//     // Initialize formData with all values set to null
//     const formData: FormData = {
//       daoName: "",
//       tokenName: "",
//       tokenSymbol: "rr",
//       lootTokenName: "n/a",
//       lootTokenSymbol: "n/a",
//       votingTransferable: false,
//       nvTransferable: false,
//       quorum: 0,
//       minRetention: 65,
//       sponsorThreshold: 0,
//       newOffering: 0,
//       votingPeriodInSeconds: 864000,
//       gracePeriodInSeconds: 86400,
//       shamans: null,
//       members: [],
//     };

//     // Fetch the campaign data from your Supabase table
//     const { data: campaignData, error: campaignError } = await supabaseClient
//       .from('campaigns')
//       .select('*')
//       .eq('campaign_id', campaignId)
//       .limit(1);

//     if (campaignError || !campaignData || campaignData.length === 0) {
//       console.error('Failed to fetch campaign data:', campaignError);
//       return null;
//     }

//     // Update daoName and tokenName
//     formData.daoName = campaignData[0].repo_name;
//     formData.tokenName = formData.daoName + "_voting";

//     // Fetch the user data from your Supabase table
//     const { data: airdropData, error: airdropError } = await supabaseClient
//       .from('airdrop_recipients')
//       .select('*')
//       .eq('campaign_id', campaignId);

//     if (airdropError || !airdropData || airdropData.length === 0) {
//       console.error('Failed to fetch airdrop data:', airdropError);
//       return null;
//     }

//     // Update members based on airdropData
//     formData.members = airdropData.map(recipient => {
//       return [recipient.address, recipient.voting, 0];
//     });

//     // ABI-encode the parameters
//     const encodedParams = web3.eth.abi.encodeParameters(
//       [
//         'string', 'string', 'string', 'string', 'string', 
//         'boolean', 'boolean', 'uint256', 'uint256', 'uint256', 
//         'uint256', 'uint256', 'uint256', 'address', 'address[][]'
//       ],
//       [
//         formData.daoName, formData.tokenName, formData.tokenSymbol, formData.lootTokenName,
//         formData.lootTokenSymbol, formData.votingTransferable, formData.nvTransferable,
//         formData.quorum, formData.minRetention, formData.sponsorThreshold, formData.newOffering,
//         formData.votingPeriodInSeconds, formData.gracePeriodInSeconds, formData.shamans, formData.members
//       ]
//     );

//     // Send the transaction
//     const transaction = await contract.methods.setUp(encodedParams).send({ from: fromAddress });

//     console.log('Transaction:', transaction);

//     return transaction;

//   } catch (err) {
//     console.error('An unexpected error occurred:', err);
//     return null;
//   }
// };

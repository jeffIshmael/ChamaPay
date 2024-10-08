"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { getUser } from "@/lib/chama";
import { useRouter } from "next/router"; // Import Next.js router
import { toast } from "sonner";

type ChamaDetailsTuple = [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  string,
  string[]
];

const Members = ({
  imageSrc,
  name,
  slug,
  chamaId,
}: {
  imageSrc: string;
  name: string;
  slug: string;
  chamaId: number;
}) => {
  const [members, setMembers] = useState<string[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [groupLink, setGroupLink] = useState("");
  const [admin, setAdmin] = useState("");
  const { isConnected, address } = useAccount();

  const {
    data: chamaDetails,
    isError,
    isLoading,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getChama",
    args: [BigInt(chamaId - 3)],
  });

  console.log(chamaDetails);

  // const router = useRouter(); // Initialize the router to generate the dynamic link

  useEffect(() => {
    if (chamaDetails) {
      const results = chamaDetails as ChamaDetailsTuple | undefined;
      if (results && Array.isArray(results[7])) {
        setMembers(results[7]);
        setAdmin(results[6]);
      }
      setLoading(false);
    }
  }, [chamaDetails]);

  // Fetch user details for all members
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (members.length > 0) {
        const details = await Promise.all(
          members.map(async (address) => {
            const userData = await getUser(address); // Fetch user details
            return { address, userData }; // Return address and userData pair
          })
        );

        const userDetailsMap = details.reduce(
          (acc, { address, userData }) => ({
            ...acc,
            [address]: userData, // Store user data keyed by address
          }),
          {}
        );
        setUserDetails(userDetailsMap);
        const inviteLink = `${window.location.origin}/Chama/${slug}`; // Dynamically generate link
        setGroupLink(inviteLink);
      }
    };

    fetchUserDetails();
  }, [members]);

  // Copy invite link to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(groupLink);
    toast.success("Invite link copied to clipboard!");
  };

  if (isError) {
    return <div>Error loading Chama details. Please try again later.</div>;
  }

  if (isLoading || loading) {
    return (
      <div className="bg-downy-100 min-h-screen flex flex-col items-center py-8 px-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-downy-100 min-h-screen flex flex-col items-center py-8 px-4">
      {/* Group Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-4 shadow-lg">
          <Image
            src={`${imageSrc}`}
            alt="Group logo"
            width={112}
            height={112}
          />
        </div>
        <h2 className="text-3xl font-bold text-downy-600 mb-2">{name}</h2>

        {/* Group Invite Link Section */}
        <div
          className="flex items-center space-x-2 text-downy-500 cursor-pointer"
          onClick={copyToClipboard} // Add click event to copy link
        >
          <span className=" font-medium">
            {groupLink ? `${groupLink}` : "Group Invite Link"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Members Section */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
          Members
        </h1>
        <div className="divide-y divide-gray-200">
          {members.map((member, index) => (
            <div key={index}>
              <div className="flex items-center flex-col-3 mt-2 space-x-4">
                <div className="bg-downy-200 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-downy-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  {userDetails[member]?.address !== address ? (
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">
                        {userDetails[member]?.name || "Loading..."}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {userDetails[member]?.address
                          ? `${userDetails[member].address.slice(
                              0,
                              6
                            )}...${userDetails[member].address.slice(-4)}`
                          : "Loading..."}
                      </p>
                    </div>
                  ) : (
                    <h2 className="text-lg font-medium text-gray-800">You</h2>
                  )}
                </div>
                <div className="flex justify-end mr-0">
                  <h4 className="text-gray-500">
                    {member === admin && "admin"}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Members;

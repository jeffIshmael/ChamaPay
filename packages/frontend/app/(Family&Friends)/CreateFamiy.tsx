"use client";

import React, { useState } from "react";
import { createChama, checkChama } from "../../lib/chama";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { contractAddress, contractAbi } from "../ChamaPayABI/ChamaPayContract";
import { useRouter } from "next/navigation";

const CreateFamily = () => {
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const amount = parseFloat(data.amount as string);
    console.log(amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    const amountInWei = Number(amount * 10 ** 18);

    try {
      const exists = await checkChama(data.name as string);
      if (exists) {
        toast.error("Choose another name.");
        return;
      } else {
        if (address && isConnected) {
          try {
            const dateObject = new Date(data.startDate as string);
            const dateInMilliseconds = dateObject.getTime();

            const hash = await writeContractAsync({
              address: contractAddress,
              abi: contractAbi,
              functionName: "registerChama",
              args: [
                BigInt(Number(amountInWei)),
                BigInt(Number(data.cycleTime)),
                BigInt(dateInMilliseconds),
                BigInt(Number(0)), //no max members
                false
              ],
            });

            if (hash) {
              try {
                await createChama(formData, "Private", address);
                console.log("done");
                toast.success(`${data.name} created successfully.`);
                router.push("/MyChamas");
              } catch (error) {
                console.log(error);
                toast.error("Unable, Try using another group name");
              }
            } else {
              toast.error("unable to create, please try again");
            }
          } catch (error) {
            console.log(error);
            toast.error("A problem occured. Ensure wallet is connected.");
          }
        } else {
          toast.error("Please connect wallet.");
        }
      }
    } catch (error) {
      toast.error("A problem occured, try again.");
      console.log(error);
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Adjusted "drop" effect */}
      <div className="absolute w-0 h-0 border-b-[16px] border-b-transparent border-l-[24px]  border-l-white border-t-[16px] border-t-transparent left-1/4 transform -translate-x-1/2 -translate-y-[56%]"></div>

      {/* <div className="absolute w-0 h-0 border-b-[16px] border-b-white border-l-[24px]  border-l-white border-t-[1px] border-t-transparent left-1/2 transform -translate-x-1/2 -translate-y-[55%]"></div> */}

      <form
        // action={createChama("Private")}
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-3xl shadow-md w-full mt-3 transform origin-top animate-fadeIn"
      >
        <div className=" flex flex-column-2 space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-downy-400"
          >
            <path
              fillRule="evenodd"
              d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
              clipRule="evenodd"
            />
            <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
          </svg>

          <input
            type="text"
            id="groupName"
            name="name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            placeholder="Enter Group Name"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount(in cKes)
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Contribution Amount"
            required
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Cycle Time (in days)
          </label>
          <input
            type="number"
            id="duration"
            name="cycleTime"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter Cycle Time"
            required
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className={`  font-semibold py-2 px-4 rounded-md ${
              isPending
                ? "bg-gray-300 text-gray-400 hover:bg-gray-300 cursor-not-allowed"
                : "bg-downy-500  hover:bg-downy-600 text-white"
            }`}
          >
            {isPending ? "Creating..." : "Create Chama"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFamily;

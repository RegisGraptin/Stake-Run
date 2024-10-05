import { NextPage } from "next";
import { Header } from "../../components/Header";
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit'
import { useAccount, useReadContract } from "wagmi";
import { ChallengeCard } from "../../components/ChallengeCard";

import StakeAndRun from "../../abi/StakeAndRun.json";
import { Address } from "viem";

import { useEffect, useState } from "react";
import { GRAPHQL_QUERY_GET_CHALLEGES, subgraphQuery } from "../../utils/graph";


const Dashboard: NextPage = () => {

    const { isConnected, address } = useAccount();

    const [challenges, setChallenges] = useState<[]>(undefined);

    async function fetchChallenges() {
        // Fetch the graph and set it to challenges
        let data = await subgraphQuery(GRAPHQL_QUERY_GET_CHALLEGES);
        console.log(data);
        if (data) {
            setChallenges(data.newChallenges);    
        } else {
            setChallenges([]);
        }
        
    }

    const { data: verifiedAccount, isLoading: verifiedAccountLoading } = useReadContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
        abi: StakeAndRun.abi,
        functionName: 'isRealHuman',
        args: [
            address
        ],
    });

    async function fetchUserStatus() {

    }

    useEffect(() => {
        if (challenges === undefined) {
            fetchChallenges()
        }
        if (verifiedAccount === undefined) {
            fetchUserStatus()
        }
    }, []);



    const onSuccess = () => { }

    const handleVerify = async (proof: ISuccessResult) => {
        console.log("Only work locally as a server is needed...")

        proof["user_address"] = address;
        let data = JSON.stringify(proof);

        console.log(data);

        const res = await fetch("http://localhost:3001/api/verify", { // route to your backend will depend on implementation
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        })
        if (!res.ok) {
            throw new Error("Verification failed."); // IDKit will display the error message to the user in the modal
        }
    };


    return (
        <div>
            <Header />

            <section className="container mx-auto pt-40">

                <div className="flex flex justify-between ">

                    <h2 className="text-4xl font-extrabold">Dashboard</h2>

                    {!verifiedAccount && (
                        <IDKitWidget
                            app_id="app_staging_aceae16e2996775ce32693a46ad64a01" // must be an app set to on-chain in Developer Portal
                            action="identification"
                            // signal={address} // proof will only verify if the signal is unchanged, this prevents tampering
                            onSuccess={onSuccess} // use onSuccess to call your smart contract
                            handleVerify={handleVerify}
                            verification_level={VerificationLevel.Orb}
                        // no use for handleVerify, so it is removed
                        // use default verification_level (orb-only), as device credentials are not supported on-chain
                        >
                            {({ open }) => <button
                                onClick={open}
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                                Verify with World ID
                            </button>}

                        </IDKitWidget>
                    )}

                    {verifiedAccount && (
                        <div className="relative inline-flex">
                            <button className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                                Human verified
                            </button>
                            <span className="absolute top-0.5 right-0.5 grid min-h-[28px] min-w-[28px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-green-600 py-1 px-1 text-xs text-white border border-white">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                    <path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    )}
                </div>


                <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 lg:py-16 lg:px-6">
                    {challenges && challenges.map((challenge, key) => {
                        return (
                            <>
                                <ChallengeCard challenge={challenge} key={key} />
                            </>
                        )
                    })}
                </div>

            </section>
        </div>
    );
};

export default Dashboard;

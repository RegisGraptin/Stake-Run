import { NextPage } from "next";
import { Header } from "../../components/Header";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import { useAccount, useReadContract } from "wagmi";
import { ChallengeCard } from "../../components/ChallengeCard";

import StakeAndRun from "../../abi/StakeAndRun.json";
import { Address } from "viem";

import { useEffect, useState } from "react";
import { GRAPHQL_QUERY_GET_CHALLEGES, subgraphQuery } from "../../utils/graph";


const Dashboard: NextPage = () => {

    const [challenges, setChallenges] = useState<[]>(undefined);
    const [verifiedAccount, setVerifiedAccount] = useState<boolean>(false);


    async function fetchChallenges() {
        // Fetch the graph and set it to challenges
        let data = await subgraphQuery(GRAPHQL_QUERY_GET_CHALLEGES);
        setChallenges(data.newChallenges);
    }

    useEffect(() => {
        if (challenges === undefined) {
            fetchChallenges()
        }
     }, []);

    
    const { isConnected, address } = useAccount();

    const onSuccess = () => {
        setVerifiedAccount(true);
    }


    return (
        <div>
            <Header />

            <section className="container mx-auto pt-40">

                <div className="flex flex justify-between ">

                    <h2 className="text-4xl font-extrabold">Dashboard</h2>

                    {!verifiedAccount && (
                        <IDKitWidget
                            app_id="app_staging_bcd4ed1fdbc0bd7f4dbbc4936e666e88" // must be an app set to on-chain in Developer Portal
                            action="identification"
                            signal={address} // proof will only verify if the signal is unchanged, this prevents tampering
                            onSuccess={onSuccess} // use onSuccess to call your smart contract
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

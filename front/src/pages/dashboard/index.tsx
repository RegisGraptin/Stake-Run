import { NextPage } from "next";
import { Header } from "../../components/Header";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import { useAccount, useReadContract } from "wagmi";
import { ChallengeCard } from "../../components/ChallengeCard";

import StakeAndRun from "../../abi/StakeAndRun.json";
import { Address } from "viem";

const Dashboard: NextPage = () => {


    const { isConnected, address } = useAccount();

    const onSuccess = () => {

    }

    const handleVerify = () => {

    }

    const { data: n_challenges } = useReadContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
        abi: StakeAndRun.abi,
        functionName: 'n_restaurants',
        args: [],
    })


    return (
        <div>
            <Header />

            <section className="container mx-auto pt-40">

                <h2 className="text-4xl font-extrabold">Dashboard</h2>

                <div>{n_challenges?.toString()}</div>


                <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 lg:py-16 lg:px-6">
                    <ChallengeCard />
                    {/* <NewChallengeCard /> */}
                </div>



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
            </section>



        </div>
    );
};

export default Dashboard;

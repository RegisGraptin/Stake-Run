import { NextPage } from "next";
import { Header } from "../../components/Header";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import { useAccount } from "wagmi";

const Dashboard: NextPage = () => {


    const { isConnected, address } = useAccount();

    const onSuccess = () => {

    }

    const handleVerify = () => {

    }



    return (
        <div>
            <Header />

            <section className="container mx-auto pt-40">

                <h2 className="text-4xl font-extrabold">Dashboard</h2>

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

import { NextPage } from "next";
import { useRouter } from "next/router";
import { Header } from "../../components/Header";
import { useReadContract } from "wagmi";
import { Address } from "viem";
import StakeAndRun from "../../abi/StakeAndRun.json";
import { useAccount } from 'wagmi'


export default function ChallengePage() {
    const router = useRouter();

    const { address } = useAccount();

    // Check if the user is already register
    const { data: userJoined, isLoading: userJoinedLoading } = useReadContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
        abi: StakeAndRun.abi,
        functionName: 'isParticipant',
        args: [
            router.query.id,
            address
        ],
    });

    return (
        <>
            <Header />


            <section className="bg-white lg:pt-40 lg:pb-20 xl:pt-40 xl:pb-32">
                <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">

                    <div className="grid mt-6">
                        <img className='rounded-lg' src="/images/image_1.jpg" />
                    </div>


                    <div className="font-light text-gray-500 sm:text-lg">
                        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">
                            Join the challenge
                        </h2>

                        <p>
                            Aldready join ? {userJoined ? "yes" : "no"}
                        </p>


                    </div>

                </div>
            </section>

            <p>Post: {router.query.id}</p>
        </>
    )
}

import { NextPage } from "next";
import { useRouter } from "next/router";
import { Header } from "../../../components/Header";
import { BaseError, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Address, parseEther } from "viem";
import StakeAndRun from "../../../abi/StakeAndRun.json";
import { useAccount } from 'wagmi'
import JoinForm from "../../../components/JoinForm";


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
                <div className="gap-16 items-center px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2">
                    <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">
                        Join the challenge
                    </h2>
                </div>
                <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">


                    <div className="grid mt-6">
                        <img className='rounded-lg' src="/images/image_1.jpg" />
                    </div>


                    {!userJoined && (
                        <div className="font-light text-gray-500 sm:text-lg">

                            <JoinForm />

                        </div>
                    )}

                    {userJoined && (
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
            </section>



        </>
    )
}

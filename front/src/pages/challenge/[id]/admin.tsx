import { NextPage } from "next";
import { useRouter } from "next/router";
import { Header } from "../../../components/Header";
import { BaseError, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Address, parseEther } from "viem";
import StakeAndRun from "../../../abi/StakeAndRun.json";
import { useAccount } from 'wagmi'
import JoinForm from "../../../components/JoinForm";
import { FormEvent } from "react";


const AdminJoinChallenge: NextPage = () => {

    const router = useRouter();

    const {
        data: hash,
        error,
        isPending,
        writeContract
    } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })
    
    const challengeId = Number(router.query.id) - 1;

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        console.log(formData)

        // Write to smart contract
        writeContract({
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
            abi: StakeAndRun.abi,
            functionName: 'joinChallengeOnBehalfOfUser',
            args: [
                challengeId,
                formData.get("telegram"),
                formData.get("user_address"),
            ],
            value: parseEther(formData.get("staking_amount"))
        })
    }

    return (
        <>
            <Header />

            <section className="container mx-auto pt-40">
                <form onSubmit={onSubmit}>

                    <div>
                        <h2 className="font-semibold text-4xl font-extrabold">Populate user challenge - Demo purpose</h2>

                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6 mt-5">
                            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                                <div className="text-gray-600">
                                    <p className="font-medium text-lg">Challenge Information</p>
                                    <p>Please fill out all the fields.</p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                        <div className="md:col-span-5">
                                            <label htmlFor="user_address">User address</label>
                                            <input type="text" name="user_address" id="user_address" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="staking_amount">Staking amount</label>
                                            <input type="number" step={0.001} name="staking_amount" id="staking_amount" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="telegram">Telegram</label>
                                            <input type="text" name="telegram" id="telegram" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5 text-right">
                                            <div className="inline-flex items-end">
                                                <button disabled={isPending} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                    {isPending ? 'Confirming...' : 'Submit'}
                                                </button>
                                            </div>
                                        </div>


                                        {hash && <div>Transaction Hash: {hash}</div>}
                                        {isConfirming && <div>Waiting for confirmation...</div>}
                                        {isConfirmed && <div>Transaction confirmed.</div>}
                                        {error && (
                                            <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

            </section>
        </>
    )

}


export default AdminJoinChallenge;

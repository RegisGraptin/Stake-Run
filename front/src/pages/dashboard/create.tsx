import { NextPage } from "next";
import { Header } from "../../components/Header";
import { BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { FormEvent } from "react";

import StakeAndRun from "../../abi/StakeAndRun.json";
import { Address } from "viem";

const CreatePage: NextPage = () => {

    const {
        data: hash,
        error,
        isPending,
        writeContract
    } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    function toTimestamp(strDate: string) {
        var datum = Date.parse(strDate);
        return datum / 1000;
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        console.log(formData)

        // Get time
        let date_start = toTimestamp(formData.get("start_time"));
        let end_time = toTimestamp(formData.get("end_time"));


        let stackedAmount = Number(formData.get("staking_amount") as string)
        stackedAmount = stackedAmount * (10 ** 1);
        const stackedAmountValue = BigInt(stackedAmount);

        // Write to smart contract
        writeContract({
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
            abi: StakeAndRun.abi,
            functionName: 'createNewChallenge',
            args: [
                formData.get("title"),
                stackedAmountValue,
                date_start,
                end_time
            ],
        })
    }

    return (
        <>
            <Header />

            <section className="container mx-auto pt-40">
                <form onSubmit={onSubmit}>

                    <div>
                        <h2 className="font-semibold text-4xl font-extrabold">Create new challenge</h2>

                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6 mt-5">
                            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                                <div className="text-gray-600">
                                    <p className="font-medium text-lg">Challenge Information</p>
                                    <p>Please fill out all the fields.</p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                        <div className="md:col-span-5">
                                            <label htmlFor="title">Title</label>
                                            <input type="text" name="title" id="title" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="staking_amount">Staking amount</label>
                                            <input type="number" name="staking_amount" id="staking_amount" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="start_time">Start time</label>
                                            <input type="date" name="start_time" id="start_time" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="end_time">End time</label>
                                            <input type="date" name="end_time" id="start_time" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
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


export default CreatePage;

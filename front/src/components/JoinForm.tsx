
import { useRouter } from "next/router";
import { BaseError, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Address, parseEther } from "viem";
import StakeAndRun from "../abi/StakeAndRun.json";
import { FormEvent } from "react";

export default function JoinForm() {

    const router = useRouter();
    const challengeId = Number(router.query.id) - 1;

    const {
        data: hash,
        error,
        isPending,
        writeContract
    } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        writeContract({
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
            abi: StakeAndRun.abi,
            functionName: 'joinChallenge',
            args: [
                challengeId,
                formData.get("telegram_handle")
            ],
            value: parseEther(formData.get("staking_amount"))
        })
    }

    return (
        <>
            <section className="container mx-auto pt-40">
                <form onSubmit={onSubmit}>

                    <div>
                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6 mt-5">
                            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                                <div className="text-gray-600">
                                    <p className="font-medium text-lg">Information</p>
                                    <p>Please fill out all the fields.</p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                        <div className="md:col-span-5">
                                            <label htmlFor="telegram_handle">Telegram handle</label>
                                            <input type="text" name="telegram_handle" id="telegram_handle" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="staking_amount">Staking amount</label>
                                            <input type="number" step="0.0001" name="staking_amount" id="staking_amount" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
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
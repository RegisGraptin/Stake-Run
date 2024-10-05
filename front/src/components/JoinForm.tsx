
import { useRouter } from "next/router";
import { BaseError, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Address, parseEther } from "viem";
import StakeAndRun from "../abi/StakeAndRun.json";

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


    const join = () => {
        writeContract({
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address,
            abi: StakeAndRun.abi,
            functionName: 'joinChallenge',
            args: [
                challengeId,
                "@test"
            ],
            value: parseEther('1')
        })
    }

    return (
        <>
            <div>
                <button
                    disabled={isPending}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => join()}
                >
                    {isPending ? 'Confirming...' : 'Join'}
                </button>

                {hash && <div>Transaction Hash: {hash}</div>}
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction confirmed.</div>}
                {error && (
                    <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                )}

            </div>
        </>
    )

}
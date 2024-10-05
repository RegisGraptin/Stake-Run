import React from "react";
import { parseAbi } from "viem";
import { useWriteContract } from "wagmi";

export const ChallengeCard = (props: any) => {

    console.log(props.challenge)

    function timestampToDate(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleString('en-GB', {year: 'numeric', month: 'numeric', day: 'numeric'})
    }

    return (
        <>
            <div>
                <a href={"/challenge/" + (props.challenge.StakeAndRun_id + 1)} className="opacity-80 hover:opacity-100" data-modal-target="default-modal" data-modal-toggle="default-modal">

                    <div className="relative grid h-[35rem] max-w-lg flex-col items-end justify-center overflow-hidden rounded-lg bg-white">
                        <div className="absolute inset-0 m-0 h-full w-full overflow-hidden rounded-none bg-transparent bg-[url('/images/run_1.png')] bg-cover bg-center">
                            <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50"></div>
                        </div>
                        <div className="relative text-center p-6 px-6 py-14 md:px-12">
                            <h2 className="mb-6 text-3xl font-medium text-white">
                                {props.challenge.title}
                            </h2>
                            <h5 className="mb-4 text-xl font-semibold text-slate-300">
                                Challenge #{Number(props.challenge.StakeAndRun_id) + 1}
                            </h5>
                            <h5 className="mb-4 text-xl font-semibold text-slate-300">
                                {timestampToDate(props.challenge.startTime)} - {timestampToDate(props.challenge.endTime)}
                            </h5>
                        </div>
                    </div>
                </a>
            </div>
        </>
    )
}

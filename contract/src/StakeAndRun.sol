// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract StakeAndRun {

    // Contract owner
    address owner;

    // Keep track of the challenge
    uint256 challengeId; 

    // Defined if a challenge is currently running or not
    bool currentChallengeRunning; 

    // Run challenge
    struct Challenge {
        string name;
        uint256 stakingAmount;
        uint256 durationDays;
        uint256 startTime;
        uint256 endTime;
        uint256 totalStaked;
        bool isCompleted;
    }

    // Record all the challenges
    mapping(uint256 => Challenge) internal challenges;


    /// Events 
    event NewChallenge(uint256 id, uint256 duration);



    constructor() {
        owner = msg.sender;
        currentChallengeRunning = false;
    }


    function createNewChallenge(
        string memory name,
        uint256 stakingAmount,
        uint256 durationDays,
        uint256 startTime,
        uint256 endTime
    ) public {
        require(startTime > block.timestamp, "Start time need to be in the future.");
        require(startTime < endTime, "Start time need to be before end time.");


        Challenge memory challenge = Challenge({
            name: name,
            stakingAmount: stakingAmount,
            durationDays: durationDays,
            startTime: startTime,
            endTime: endTime,
            totalStaked: 0,
            isCompleted: false
        });

        challenges[challengeId] = challenge;

        emit NewChallenge(challengeId, durationDays);
        
        challengeId++;
    }


    // Leaderboard
    // telegram handle + Kilometres

    // Is Participants

    // 


    // Stake & Join 



    // One -> Then One 

}

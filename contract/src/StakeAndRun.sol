// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract StakeAndRun {

    // Contract owner
    address owner;

    // Keep track of the challenge
    uint256 counterChallengeId; 

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

    struct UserMetadata {
        string telegramHandler;
        uint256 kilometersRunned;
        uint256 lastUpdated;
        uint256 totalRestDay;
    }

    // Record all the challenges
    mapping(uint256 => Challenge) challenges;

    mapping(uint256 => mapping(address => bool)) participants;

    mapping(uint256 => mapping(address => UserMetadata)) userInfo;

    /// Events 
    event NewChallenge(uint256 id, uint256 duration);
    event NewUser(uint256 challengeId, address user);
    event DailyRunUploaded(uint256 challengeId, address user, uint256 distance);

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

        challenges[counterChallengeId] = challenge;

        emit NewChallenge(counterChallengeId, durationDays);
        
        counterChallengeId++;
    }

    function getChallengeDetail(uint256 challengeId) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function isParticipant(uint256 challengeId, address user) public view returns (bool) {
        return participants[challengeId][user];
    }


    function joinChallenge(
        uint256 challengeId,
        string memory telegramHandler
    ) payable external {
        // Check the challenge has not started yet
        require(challengeId == counterChallengeId - 1, "Challenge does not exist");
        require(challenges[challengeId].startTime > block.timestamp, "Challenge has already start!");
        require(msg.value >= challenges[challengeId].stakingAmount, "Not enough eth");
        require(!participants[challengeId][msg.sender], "Already a participant");

        participants[challengeId][msg.sender] = true;
        userInfo[challengeId][msg.sender] = UserMetadata({
            telegramHandler: telegramHandler,
            kilometersRunned: 0,
            lastUpdated: challenges[challengeId].startTime,
            totalRestDay: 0
        });

        // Emit event
        emit NewUser(challengeId, msg.sender);
    }

    function addDailyRun(uint256 challengeId, uint256 distanceKm) external {
        require(challenges[challengeId].startTime < block.timestamp, "Challenge has not started!");
        require(!challenges[challengeId].isCompleted, "Challenge is completed!");
        require(isParticipant(challengeId, msg.sender), "User is not a participant!");
        require(distanceKm > 1, "Must run at least 1km");

        // Get user info
        UserMetadata memory user = userInfo[challengeId][msg.sender];
        uint256 duration = block.timestamp - user.lastUpdated;

        // User did not submit the last day
        if (duration > 1.2 days) {
            user.totalRestDay = duration % 1 days;
        }

        user.kilometersRunned += distanceKm;
        user.lastUpdated = block.timestamp;

        emit DailyRunUploaded(challengeId, msg.sender, distanceKm);
    }



    // Leaderboard
    // telegram handle + Kilometres

    // Is Participants

    // 


    // Stake & Join 



    // One -> Then One 

}

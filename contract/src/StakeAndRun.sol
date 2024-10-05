// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { ByteHasher } from './helpers/ByteHasher.sol';
import { IWorldID } from './interfaces/IWorldID.sol';

contract StakeAndRun {
	
    using ByteHasher for bytes;
    
    //// Worldcoin properties
    /// @notice Thrown when attempting to reuse a nullifier
    error InvalidNullifier();

    /// @dev The address of the World ID Router contract that will be used for verifying proofs
    IWorldID internal immutable worldId;

    /// @dev The keccak256 hash of the externalNullifier (unique identifier of the action performed), combination of appId and action
    uint256 internal immutable externalNullifierHash;

    /// @dev The World ID group ID (1 for Orb-verified)
    uint256 internal immutable groupId = 1;

    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    mapping(bytes32 => bool) internal knownHash;

    address nodeServerOperator;

    /// Contract properties
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

    mapping(address => bool) public isRealHuman; // Verify the user with worldcoin

    mapping(uint256 => mapping(address => UserMetadata)) userInfo;

    mapping(uint256 => address[]) savedLeaderBoard;

    address[] currentParticipants;

    /// Events
    event NewChallenge(uint256 id, uint256 startTime, uint256 endTime);
    event NewUser(uint256 challengeId, address user, string telegram);
    event DailyRunUploaded(uint256 challengeId, address user, uint256 distance);
    event ChallengeCompleted(uint256 challengeId);

    constructor(
        // IWorldID _worldId, // Does not exists on Scroll ???
        string memory _appId,
        string memory _action
    ) {
        owner = msg.sender;
        currentChallengeRunning = false;
        nodeServerOperator = 0x5fC01da058Da238756133c51D4152d32279dF90F;

        // worldId = _worldId;
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }

    function createNewChallenge(
        string memory name,
        uint256 stakingAmount,
        uint256 startTime,
        uint256 endTime
    ) public {
        require(
            startTime > block.timestamp,
            "Start time need to be in the future."
        );
        require(startTime < endTime, "Start time need to be before end time.");

        Challenge memory challenge = Challenge({
            name: name,
            stakingAmount: stakingAmount,
            startTime: startTime,
            endTime: endTime,
            totalStaked: 0,
            isCompleted: false
        });

        challenges[counterChallengeId] = challenge;

        emit NewChallenge(counterChallengeId, startTime, endTime);

        counterChallengeId++;
    }

    function getChallengeDetail(
        uint256 challengeId
    ) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function isParticipant(
        uint256 challengeId,
        address user
    ) public view returns (bool) {
        return participants[challengeId][user];
    }

    function joinChallenge(
        uint256 challengeId,
        string memory telegramHandler
    ) external payable {
        // Check the challenge has not started yet
        require(
            challengeId == counterChallengeId - 1,
            "Challenge does not exist"
        );
        require(
            challenges[challengeId].startTime > block.timestamp,
            "Challenge has already start!"
        );
        require(
            msg.value >= challenges[challengeId].stakingAmount,
            "Not enough eth"
        );
        require(
            !participants[challengeId][msg.sender],
            "Already a participant"
        );
        // require(isRealHuman[msg.sender], "Not a verified user"); // FIXME ::

        participants[challengeId][msg.sender] = true;
        userInfo[challengeId][msg.sender] = UserMetadata({
            telegramHandler: telegramHandler,
            kilometersRunned: 0,
            lastUpdated: challenges[challengeId].startTime,
            totalRestDay: 0
        });

        currentParticipants.push(msg.sender);

        // Increase the stacking amount of the challenge
        challenges[challengeId].stakingAmount += msg.value;

        // Emit event
        emit NewUser(challengeId, msg.sender, telegramHandler);
    }

    function joinChallengeOnBehalfOfUser(
        uint256 challengeId,
        string memory telegramHandler,
        address user
    ) external payable {
        // FIXME :: Telegram option to allow user to join the com
        // FIXME :: Need to be deleted once we have metamask on the telegram working
        participants[challengeId][user] = true;
        userInfo[challengeId][user] = UserMetadata({
            telegramHandler: telegramHandler,
            kilometersRunned: 0,
            lastUpdated: challenges[challengeId].startTime,
            totalRestDay: 0
        });

        currentParticipants.push(user);

        // Increase the stacking amount of the challenge
        challenges[challengeId].stakingAmount += msg.value;

        // Emit event
        emit NewUser(challengeId, user, telegramHandler);
    }


    function addDailyRun(uint256 challengeId, uint256 distanceKm) external {
        // FIXME :: As we depends on time, it cannot be tested for the demo, need to be remove when deployed
        // require(
        //     challenges[challengeId].startTime < block.timestamp,
        //     "Challenge has not started!"
        // );

        require(
            !challenges[challengeId].isCompleted,
            "Challenge is completed!"
        );
        require(
            isParticipant(challengeId, msg.sender),
            "User is not a participant!"
        );
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

    function addDailyRunOnBehalfOfUser(uint256 challengeId, uint256 distanceKm, address userAdress) external {
        // The telegram bot will sponsor the tx

        // FIXME :: Same remarks above for demo purpose
        // require(
        //     challenges[challengeId].startTime < block.timestamp,
        //     "Challenge has not started!"
        // );
        require(
            !challenges[challengeId].isCompleted,
            "Challenge is completed!"
        );
        require(
            isParticipant(challengeId, userAdress),
            "User is not a participant!"
        );
        require(distanceKm > 1, "Must run at least 1km");

        // Get user info
        UserMetadata memory user = userInfo[challengeId][userAdress];
        uint256 duration = block.timestamp - user.lastUpdated;

        // User did not submit the last day
        if (duration > 1.2 days) {
            user.totalRestDay = duration % 1 days;
        }

        user.kilometersRunned += distanceKm;
        user.lastUpdated = block.timestamp;

        emit DailyRunUploaded(challengeId, userAdress, distanceKm);
    }

    function getLeaderBoard(uint256 challengeId) view public returns(address[] memory) {
        // We alrady have the leaderboard
        if (savedLeaderBoard[challengeId].length > 0) {
            return savedLeaderBoard[challengeId];
        }

        // Copy current user
        address[] memory temp = new address[](currentParticipants.length);
        for (uint i = 0; i < currentParticipants.length; i++) {
            temp[i] = currentParticipants[i];
        }

        // Order them based on the distance
        for (uint i = 0; i < temp.length; i++) {
            uint256 km_i = userInfo[challengeId][currentParticipants[i]].kilometersRunned;
            for (uint j = i + 1; j < temp.length; j++) {
                uint256 km_j = userInfo[challengeId][currentParticipants[j]].kilometersRunned;
                if (km_i < km_j) {
                    address t = temp[i];
                    temp[i] = temp[j];
                    temp[j] = t;
                }
            }
        }

        return temp;
    }

    function completeChallenge(uint256 challengeId) external {
        require(
            challenges[challengeId].endTime < block.timestamp,
            "Challenge has not ended!"
        );

        // Copy current user
        address[] memory temp = new address[](currentParticipants.length);
        for (uint i = 0; i < currentParticipants.length; i++) {
            temp[i] = currentParticipants[i];
        }

        // Order them based on the distance
        for (uint i = 0; i < temp.length; i++) {
            uint256 km_i = userInfo[challengeId][currentParticipants[i]].kilometersRunned;
            for (uint j = i + 1; j < temp.length; j++) {
                uint256 km_j = userInfo[challengeId][currentParticipants[j]].kilometersRunned;
                if (km_i < km_j) {
                    address t = temp[i];
                    temp[i] = temp[j];
                    temp[j] = t;
                }
            }
        }

        // Store the leaderboard
        for (uint i = 0; i < temp.length; i++) {
            savedLeaderBoard[challengeId].push(temp[i]);
        }

        Challenge memory challengeDetail = challenges[challengeId];

        // Reward best 3 users
        if (temp.length > 1) {
            uint256 sendValue = (challengeDetail.stakingAmount * 5) / 10;
            (bool sent, bytes memory data) = temp[0].call{value: sendValue}("");
            require(sent, "Failed to send Ether");
        }

        if (temp.length > 2) {
            uint256 sendValue = (challengeDetail.stakingAmount * 3) / 10;
            (bool sent, bytes memory data) = temp[0].call{value: sendValue}("");
            require(sent, "Failed to send Ether");
        }
        
        if (temp.length > 3) {
            uint256 sendValue = (challengeDetail.stakingAmount * 2) / 10;
            (bool sent, bytes memory data) = temp[0].call{value: sendValue}("");
            require(sent, "Failed to send Ether");
        }

        emit ChallengeCompleted(challengeId);

        // Set the challenge state
        delete currentParticipants;
        challenges[challengeId].isCompleted = true;
    }

    // FIXME :: could not work on SCROLL - instead see verifyByUsingCloudData
    /// @param signal An arbitrary input from the user, usually the user's wallet address
    /// @param root The root (returned by the IDKit widget).
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the IDKit widget).
    /// @param proof The zero-knowledge proof that demonstrates the claimer is registered with World ID (returned by the IDKit widget).
    function verifyAndExecute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public {
        // First make sure this person hasn't done this before
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // Now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // Record the user has done this, so they can't do it again (proof of uniqueness)
        nullifierHashes[nullifierHash] = true;

        // Finally, set the user has verified
        isRealHuman[msg.sender] = true;
    }

    function verifyByUsingCloudData(bytes32 userHash, address user) public {
        require(msg.sender == nodeServerOperator, "Not the node operator");
        require(!knownHash[userHash], "Already know this hash");
        knownHash[userHash] = true;
        isRealHuman[user] = true;
    }


}

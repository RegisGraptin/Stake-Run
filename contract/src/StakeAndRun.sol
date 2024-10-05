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

    mapping(address => bool) isRealHuman; // Verify the user with worldcoin

    mapping(uint256 => mapping(address => UserMetadata)) userInfo;

    address[] currentParticipants;

    /// Events
    event NewChallenge(uint256 id, uint256 startTime, uint256 endTime);
    event NewUser(uint256 challengeId, address user);
    event DailyRunUploaded(uint256 challengeId, address user, uint256 distance);
    event ChallengeCompleted(uint256 challengeId);

    constructor(
        // IWorldID _worldId, // Does not exists on Scroll ???
        string memory _appId,
        string memory _action
    ) {
        owner = msg.sender;
        currentChallengeRunning = false;

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
        emit NewUser(challengeId, msg.sender);
    }

    function addDailyRun(uint256 challengeId, uint256 distanceKm) external {
        require(
            challenges[challengeId].startTime < block.timestamp,
            "Challenge has not started!"
        );
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


}

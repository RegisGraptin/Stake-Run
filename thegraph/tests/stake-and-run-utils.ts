import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ChallengeCompleted,
  DailyRunUploaded,
  NewChallenge,
  NewUser
} from "../generated/StakeAndRun/StakeAndRun"

export function createChallengeCompletedEvent(
  challengeId: BigInt
): ChallengeCompleted {
  let challengeCompletedEvent = changetype<ChallengeCompleted>(newMockEvent())

  challengeCompletedEvent.parameters = new Array()

  challengeCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )

  return challengeCompletedEvent
}

export function createDailyRunUploadedEvent(
  challengeId: BigInt,
  user: Address,
  distance: BigInt
): DailyRunUploaded {
  let dailyRunUploadedEvent = changetype<DailyRunUploaded>(newMockEvent())

  dailyRunUploadedEvent.parameters = new Array()

  dailyRunUploadedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  dailyRunUploadedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  dailyRunUploadedEvent.parameters.push(
    new ethereum.EventParam(
      "distance",
      ethereum.Value.fromUnsignedBigInt(distance)
    )
  )

  return dailyRunUploadedEvent
}

export function createNewChallengeEvent(
  id: BigInt,
  startTime: BigInt,
  endTime: BigInt
): NewChallenge {
  let newChallengeEvent = changetype<NewChallenge>(newMockEvent())

  newChallengeEvent.parameters = new Array()

  newChallengeEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  newChallengeEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  newChallengeEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return newChallengeEvent
}

export function createNewUserEvent(
  challengeId: BigInt,
  user: Address,
  telegram: string
): NewUser {
  let newUserEvent = changetype<NewUser>(newMockEvent())

  newUserEvent.parameters = new Array()

  newUserEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  newUserEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  newUserEvent.parameters.push(
    new ethereum.EventParam("telegram", ethereum.Value.fromString(telegram))
  )

  return newUserEvent
}

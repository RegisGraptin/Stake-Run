import {
  ChallengeCompleted as ChallengeCompletedEvent,
  DailyRunUploaded as DailyRunUploadedEvent,
  NewChallenge as NewChallengeEvent,
  NewUser as NewUserEvent
} from "../generated/StakeAndRun/StakeAndRun"
import {
  ChallengeCompleted,
  DailyRunUploaded,
  NewChallenge,
  NewUser
} from "../generated/schema"

export function handleChallengeCompleted(event: ChallengeCompletedEvent): void {
  let entity = new ChallengeCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDailyRunUploaded(event: DailyRunUploadedEvent): void {
  let entity = new DailyRunUploaded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.distance = event.params.distance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewChallenge(event: NewChallengeEvent): void {
  let entity = new NewChallenge(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.StakeAndRun_id = event.params.id
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewUser(event: NewUserEvent): void {
  let entity = new NewUser(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

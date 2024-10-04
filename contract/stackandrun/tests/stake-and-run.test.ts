import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ChallengeCompleted } from "../generated/schema"
import { ChallengeCompleted as ChallengeCompletedEvent } from "../generated/StakeAndRun/StakeAndRun"
import { handleChallengeCompleted } from "../src/stake-and-run"
import { createChallengeCompletedEvent } from "./stake-and-run-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let challengeId = BigInt.fromI32(234)
    let newChallengeCompletedEvent = createChallengeCompletedEvent(challengeId)
    handleChallengeCompleted(newChallengeCompletedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ChallengeCompleted created and stored", () => {
    assert.entityCount("ChallengeCompleted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ChallengeCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "challengeId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})

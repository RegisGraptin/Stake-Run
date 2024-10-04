// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {StakeAndRun} from "../src/StakeAndRun.sol";

contract CounterTest is Test {
    StakeAndRun public stakeAndRun;

    function setUp() public {
        stakeAndRun = new StakeAndRun();
    }

}

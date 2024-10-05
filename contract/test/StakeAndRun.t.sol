// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {StakeAndRun} from "../src/StakeAndRun.sol";

contract CounterTest is Test {
    StakeAndRun public stakeAndRun;

    function setUp() public {

        string memory appId = "app_staging_bcd4ed1fdbc0bd7f4dbbc4936e666e88";
        string memory action = "identification";
        
        stakeAndRun = new StakeAndRun(appId, action);
    }

}

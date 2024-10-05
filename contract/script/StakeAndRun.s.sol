// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StakeAndRun} from "../src/StakeAndRun.sol";

contract StakeAndRunScript is Script {
    StakeAndRun public stakeAndRun;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        string memory appId = "app_staging_bcd4ed1fdbc0bd7f4dbbc4936e666e88";
        string memory action = "identification";
        
        stakeAndRun = new StakeAndRun(appId, action);

        vm.stopBroadcast();
    }
}

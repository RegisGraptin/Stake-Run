import 'dotenv/config'

import cors from "cors";
import express from "express";
import { verifyCloudProof } from '@worldcoin/idkit'

import { ethers } from "ethers";

import bodyParser from "body-parser";

import CONTRACT_ABI from "./data/StakeAndRun.json" with { type: "json" };

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SCROLL_RPC_URL = process.env.SCROLL_RPC_URL;


const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Welcome to my server!');
});

app.post('/api/verify', async (req, res) => {

    console.log(req.body)

    const proof = req.body
    const app_id = process.env.APP_ID
    const action = process.env.ACTION_ID
	const verifyRes = await verifyCloudProof(proof, app_id, action)

    const user_address = req.body.user_address;

    console.log(verifyRes);
    console.log(CONTRACT_ADDRESS);

    if (verifyRes.success) {
        // FIXME call the smart contract with the server private key allowing user to be identify as human
        let provider = new ethers.JsonRpcProvider(SCROLL_RPC_URL, );
        let signer = new ethers.Wallet(PRIVATE_KEY, provider);
        let contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI.abi,
            signer
        );
        let tx = await contract.verifyByUsingCloudData(
            proof.nullifier_hash,
            user_address
        );

        // This is where you should perform backend actions if the verification succeeds
        // Such as, setting a user as "verified" in a database
        res.status(200).send(verifyRes);
    } else {
        // This is where you should handle errors from the World ID /verify endpoint. 
        // Usually these errors are due to a user having already verified.
        res.status(400).send(verifyRes);
    }
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
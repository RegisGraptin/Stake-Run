# Stake & Run

**Project Description**:

**Problem:** Many people struggle with self-motivation when it comes to achieving long-term fitness goals, particularly when sustained effort is required. To address this, we build **Stake & Run**, a Telegram bot application that allows users to stake ETH and participate in fitness challenges, such as a 30-day running challenge.

**Solution:** In Stake & Run, users stake ETH to join the challenge and upload daily screenshots of their runs to the Telegram bot. An integrated AI coach validates the uploaded data. User performance is tracked on-chain using The Graph for transparency. The challenge smart contract is deployed on Scroll Sepolia and enforces clear rules: users must complete the challenge to get their staked ETH back. If they fail (e.g., miss more than 4 days), their stake is slashed and awarded to the top performers who run the most distance over the 30 days.

**Incentives:** The staking and slashing mechanisms, managed by the smart contract, provide multiple incentives to keep users motivated:

1. **Earn rewards** – The chance to earn interest is a strong motivator, especially for longer challenges.
2. **Accountability** – Avoiding slashing keeps users focused on consistent participation.
3. **Competition** – The prize pool made up of slashed stakes motivates participants to run more and compete for rewards.

**Broader Impact:** This concept can be adapted for other challenges requiring consistent effort and proof of work, such as learning a programming language, building habits, or losing weight. By leveraging financial incentives and community engagement, Stake & Run encourages commitment, fosters camaraderie, and strengthens human connections.


**Product Features:**

- **Easy Staking:** Users can easily stake ETH through the Telegram bot by scanning a QR code or clicking a link to deposit ETH and join the challenge.
    
- **Run Validation:** Users upload a screenshot of their run directly to the bot. A built-in LLM validates the run based on competition rules, such as ensuring the activity is over 1 km, qualifies as running or walking, and occurred within the same day.
    
- **Leaderboard & Rewards:** Participants can check the leaderboard, view their current rewards, and review the competition rules at any time, making it easy to stay updated on their progress.
    
- **AI Coaching:** The Telegram bot includes an AI coach that sends daily motivational messages to keep users engaged. These messages remind participants to upload their run and check the leaderboard with encouraging quotes like, "The only bad workout is the one that didn't happen" or "You're collecting high-fives from your future self."
    
- **Web Application Access:** Users can also enroll in the challenge through a web application using Worldcoin authentication. The web app provides an alternative platform where participants can track their rankings on the leaderboard.


## Technical implementation

### Scroll 

We have deployed our smart contract on Scroll. You can find the contract at "0xa3757957bdE26F6581b81b0363E00F635628c4E4". You can see more information and the verification of this contract on scroll explorer, see: https://sepolia.scrollscan.com/address/0xa3757957bdE26F6581b81b0363E00F635628c4E4

### The Graph

Instead of fetching the data direclty from the smart contract, we are using the graph. For each event created, the data will be indexed on the graph. And we can use it, later on, on our front end to retrieve it. For instance, we are using it to fetch the current and past challenges. 
You can see it here: https://github.com/RegisGraptin/StakeAndRun/blob/master/front/src/pages/dashboard/index.tsx#L22
The graph endpoint we are using is: https://api.studio.thegraph.com/query/90703/stakeandrun/v0.0.4

### Worldcoin

We want to have a fair competition betweent participants, and make sure that the participants are real person. To help us in this process, we have integrated world coin. As we are currently using Scroll, it is not possible to verify the user proof from world coin. The workaround use here, is to rely on another party that is going to request the validity of the proof of the user to worldcoin, and in case it is valide, sign a transaction to the smartcontract and attest that the given address is a valid human. We have develop a simple backend app, that you can find in the 'worldcoin_server'.
On the frontend, we are doing the verification here: https://github.com/RegisGraptin/StakeAndRun/blob/master/front/src/pages/dashboard/index.tsx#L58
Else, see the server to see the process doing by the trusted party: https://github.com/RegisGraptin/StakeAndRun/blob/master/wordcoin_server/server.mjs

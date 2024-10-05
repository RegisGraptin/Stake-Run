
import json
import os
from typing import List
import dotenv
import requests

from web3 import Web3

GRAPHQL_QUERY_GET_CHALLEGES = "query {newChallenges { StakeAndRun_id blockNumber blockTimestamp startTime endTime }}"

def get_challenge_data() -> List[dict]:
    """Fetch from the graph the last challenges"""
    graph_endpoint = os.environ["GRAPH_ENDPOINT"]
    res = requests.post(f"{graph_endpoint}/", json={
        "query": GRAPHQL_QUERY_GET_CHALLEGES,
    })
    return res.json()["data"]["newChallenges"]


class StakeAndRunContract:

    def _read_abi_contract(self) -> dict:
        with open("./data/StakeAndRun.json", 'r') as file:
            data = json.load(file)
        return data["abi"]

    def __init__(self) -> None:
        self.w3 = Web3(Web3.HTTPProvider(os.environ["RPC_URL"]))
        
        abi = self._read_abi_contract()
        address = os.environ["CONTRACT_ADDRESS"]
        
        self.contract_instance = self.w3.eth.contract(address=address, abi=abi)
        
    def get_contract_leaderboard(self, challenge_id: int): 
        data = self.contract_instance.functions.getLeaderBoard(challenge_id).call()
        print(data)
    


if __name__ == '__main__':
    dotenv.load_dotenv(".env")

    # get_challenge_data()

    contract = StakeAndRunContract()
    contract.get_contract_leaderboard(0)

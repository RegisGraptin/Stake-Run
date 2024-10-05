import uuid
import enum
import dotenv
import os
import requests
import asyncio
import definitions as defs
from constants import *

from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import base64
import web3
from eth_abi import decode

dotenv.load_dotenv()

CIRCLE_API_KEY = os.getenv("CIRCLE_API_KEY")
ENTITY_SECRET = os.getenv("ENTITY_SECRET", "")
WALLET_SET_ID = os.getenv("WALLET_SET_ID")
with open("data/setup/key.pub", "r") as f:
    PUBLIC_KEY = f.read()

def generate_entity_secret_ciphertext():
    entity_secret = bytes.fromhex(ENTITY_SECRET)
    if len(entity_secret) != 32:
        raise Exception("invalid entity secret")

    # encrypt data by the public key
    public_key = RSA.importKey(PUBLIC_KEY)
    cipher_rsa = PKCS1_OAEP.new(key=public_key, hashAlgo=SHA256)
    encrypted_data = cipher_rsa.encrypt(entity_secret)

    # encode to base64
    ciphertext = base64.b64encode(encrypted_data)

    return ciphertext.decode()



def execute_smart_contract(wallet_id: str, contract_address: str, abi_function_signature: str, abi_parameters: list, amount: float | None = None, ref_id: str | None = None):
    url = "https://api.circle.com/v1/w3s/developer/transactions/contractExecution"

    payload = {
        "walletId": wallet_id,
        "contractAddress": contract_address,
        "abiFunctionSignature": abi_function_signature,
        "abiParameters": abi_parameters,
        "idempotencyKey": str(uuid.uuid4()),
        "entitySecretCiphertext": generate_entity_secret_ciphertext(),
        "feeLevel": "MEDIUM"
    }

    if amount is not None:
        payload["amount"] = str(amount * 1e18) # 18 decimals for ETH
        
    if ref_id is not None:
        payload["refId"] = ref_id

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {CIRCLE_API_KEY}"
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()

def encode_address(address: str) -> str:
    address = address.lower().removeprefix('0x')
    if len(address) != 40:
        raise ValueError("Invalid Ethereum address length")
    address_bytes = bytes.fromhex(address)
    return '0x' + (b'\x00' * 12 + address_bytes).hex()

def cctp_burn(user: defs.User, destination_chain: defs.Blockchain, destination_address: str, amount: float, ref_id: str):
    # TODO looks like we need to wait for the transaction 1 before sending transaction 2 otherwise cricle will reject it
    amount_str = str(round(amount * 1e6))
    chain = user.wallet.blockchain.value
    print(chain)
    response1 = execute_smart_contract(user.wallet.id, USDC_TOKEN_ADDRESSES[chain], "approve(address,uint256)", [CCTP_TOKEN_MESSENGER[chain], amount_str])
    
    abi_function_signature = "depositForBurn(uint256,uint32,bytes32,address)"
    encoded_destination_address = encode_address(destination_address)    
    abi_parameters = [amount_str, CCTP_DOMAINS[destination_chain.value], encoded_destination_address, USDC_TOKEN_ADDRESSES[chain]]    
    response2 = execute_smart_contract(user.wallet.id, CCTP_TOKEN_MESSENGER[chain], abi_function_signature, abi_parameters, ref_id=ref_id)
    
    return response1, response2


def cctp_burn_step_1(user: defs.User, amount: float, ref_id: str):
    amount_str = str(round(amount * 1e6))
    chain = user.wallet.blockchain.value
    return execute_smart_contract(user.wallet.id, USDC_TOKEN_ADDRESSES[chain], "approve(address,uint256)", [CCTP_TOKEN_MESSENGER[chain], amount_str], ref_id=ref_id)

def cctp_burn_step_2(user: defs.User, destination_chain: defs.Blockchain, destination_address: str, amount: float, ref_id: str):
    amount_str = str(round(amount * 1e6))
    chain = user.wallet.blockchain.value
    abi_function_signature = "depositForBurn(uint256,uint32,bytes32,address)"
    encoded_destination_address = encode_address(destination_address)    
    abi_parameters = [amount_str, CCTP_DOMAINS[destination_chain.value], encoded_destination_address, USDC_TOKEN_ADDRESSES[chain]]    
    return execute_smart_contract(user.wallet.id, CCTP_TOKEN_MESSENGER[chain], abi_function_signature, abi_parameters, ref_id=ref_id)

def get_message_bytes_and_hash(blockchain: defs.Blockchain, tx_hash: str) -> tuple[str, str]:
    provider = web3.Web3(web3.HTTPProvider(INFURA_ENPOINTS[blockchain.value]))
    # Get the transaction receipt
    transaction_receipt = provider.eth.get_transaction_receipt(tx_hash)

    # Create the event topic
    event_topic = web3.Web3.keccak(text='MessageSent(bytes)').hex()

    # Find the log with the matching topic
    log = next((l for l in transaction_receipt['logs'] if l['topics'][0].hex() == event_topic), None)

    if log is None:
        raise ValueError("MessageSent event not found in transaction logs")

    # Decode the log data
    message_bytes = decode(['bytes'], log['data'])[0]

    # Calculate the message hash
    message_hash = web3.Web3.keccak(message_bytes).hex()

    return f'0x{message_bytes.hex()}', f'0x{message_hash}'

def get_atttestation(message_hash: str) -> str | None:
    url = f"https://iris-api-sandbox.circle.com/v1/attestations/{message_hash}"

    headers = {"accept": "application/json"}

    response = requests.get(url, headers=headers).json()
    if response['status'] != 'complete':
        return None
    return response['attestation']

def cctp_mint(source_chain: defs.Blockchain, destination_walled_id: str, destination_chain: defs.Blockchain, tx_hash: str):
    contract_address = CCTP_MESSAGE_TRANSMITTER[destination_chain.value]
    message_bytes, message_hash = get_message_bytes_and_hash(source_chain, tx_hash)
    attestation = get_atttestation(message_hash)
    print("Attestation received")
    abi_function_signature = "receiveMessage(bytes,bytes)"
    abi_parameters = [message_bytes, attestation]
    return execute_smart_contract(destination_walled_id, contract_address, abi_function_signature, abi_parameters)
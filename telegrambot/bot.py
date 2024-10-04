import io
import os 
import logging
import pathlib
from typing import Any
import dotenv
import base64
import qrcode
import telegram
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ChatAction
from telegram.ext import filters, MessageHandler, ApplicationBuilder, CommandHandler, ContextTypes, CallbackQueryHandler
import uuid
import requests
import json
from datetime import datetime, time, timedelta
#import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import random
import openai
from typing import List, Optional, Type, TypeVar
from pydantic import BaseModel, Field, StrictStr
import requests
from datetime import date

T = TypeVar('T', bound=BaseModel) 
SYSTEM_PROMPT = pathlib.Path("system_prompt.txt").read_text()
USDC_CONTRACT_ADDRESS = '0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D'
CHALLENGE_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
CHAIN_ID = "534351" # scroll sepolia chain id


dotenv.load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

def load_json_as_model(path: str, model: Type[T]) -> T:
    with open(path, 'r') as file:
        return model.model_validate_json(file.read())

def store_json_as_model(path: str, model: BaseModel):
    with open(path, 'w') as file:
        file.write(model.model_dump_json())

class StoreableBaseModel(BaseModel):
    def save(self, path: str):
        store_json_as_model(path, self)
    
    @classmethod
    def load(cls, path: str):
        return load_json_as_model(path, cls)  
    

class FitnessUser(StoreableBaseModel):
    telegram_id: int
    username: str
    total_kilometers: float = Field(default=0)
    valid_days: int = Field(default=0)
    rest_days: int = Field(default=0)
    last_run_date: Optional[date] = Field(default=None)
    join_date: date = Field(default_factory=date.today)

    def add_run(self, kilometers: float):
        self.total_kilometers += kilometers
        self.valid_days += 1
        self.last_run_date = date.today()

    def add_rest_day(self):
        self.rest_days += 1   

    @classmethod
    def load_user(cls, telegram_id: int):
        path = f'data/fitness_users/{telegram_id}.json'
        try:
            return cls.load(path)
        except FileNotFoundError:
            return None
        except Exception as e:
            logging.error(f"Error loading user data for {telegram_id}: {e}")
            return None

    def save_user(self):
        path = f'data/fitness_users/{self.telegram_id}.json'
        self.save(path)

class RunEvaluation(BaseModel):
    date: str
    valid: bool
    kilometers: float
    message: str

class MockChallengeContract(StoreableBaseModel):
    staking_amount: float = Field(default=10.0)
    members: set[int] = Field(default_factory=set)
    pool: float = Field(default=0.0)
    
    def join(self, telegram_id: int) -> bool:
        if telegram_id in self.members:
            return False
        self.members.add(telegram_id)
        self.pool += self.staking_amount
        return True

try:
    CHALLENGE = MockChallengeContract.load("data/challenge.json")
except FileNotFoundError:
    CHALLENGE = MockChallengeContract(staking_amount=10.0)
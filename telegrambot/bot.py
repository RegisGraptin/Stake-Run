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



async def join_challenge(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat is None or update.effective_user is None:
        logging.error(f"Invalid update object, missing effective chat or user: {update}")
        return

    try:
        if update.effective_user.id in CHALLENGE.members:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="You're already part of the challenge!")
            return
    except Exception as e:
        logging.error(f"Error loading user data: {e}")
        # If there's an error loading the user, we'll create a new one

    # Create a new user
    user = FitnessUser(
        telegram_id=update.effective_user.id,
        username=update.effective_user.username or "",
        join_date=date.today()  # Explicitly set join_date
    )
    user.save_user()
    
    CHALLENGE.join(user.telegram_id)
    CHALLENGE.save("data/challenge.json")

# Generate QR code for USDC staking
    amount = CHALLENGE.staking_amount
    eip681_url = f"ethereum:pay-{USDC_CONTRACT_ADDRESS}@{CHAIN_ID}/transfer?address={CHALLENGE_CONTRACT_ADDRESS}&uint256={int(amount * 1e6)}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(eip681_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    bio = io.BytesIO()
    img.save(bio, 'PNG')
    bio.seek(0)
    
    metamask_deep_link = f"https://metamask.app.link/send/{eip681_url}"

    await context.bot.send_photo(
        chat_id=update.effective_chat.id,
        photo=bio,
        caption=f"Scan this QR code with your mobile wallet to stake USDC and join the challenge.\n\n<a href='{metamask_deep_link}'>Or click here to send directly via MetaMask</a>",
        parse_mode=telegram.constants.ParseMode.HTML
    )

async def show_leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat is None:
        logging.error(f"Invalid update object, missing effective chat: {update}")
        return

    users = []
    for filename in os.listdir('data/fitness_users'):
        user_id = int(filename.split('.')[0])
        user = FitnessUser.load_user(user_id)
        if user:
            users.append(user)

    users.sort(key=lambda u: u.total_kilometers, reverse=True)

    leaderboard = "🏆 Leaderboard 🏆\n\n"
    for i, user in enumerate(users[:10], 1):
        leaderboard += f"{i}. @{user.username}: {user.total_kilometers:.1f} kilometers\n"

    await context.bot.send_message(chat_id=update.effective_chat.id, text=leaderboard)

async def submit_result(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = "Please upload the screenshot for your run 😊"
    await context.bot.send_message(chat_id=update.effective_chat.id, text=message)



async def check_reward(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # TODO should that be the total pool value, or the user reward base don their current leaderboard positoin? Since the function name is check reward
    total_pool = CHALLENGE.pool
    current_value = CHALLENGE.pool * 1.05
    await context.bot.send_message(chat_id=update.effective_chat.id, text=f"Total USDC in the pool: {total_pool:,.1f}\nCurrent value with interest: {current_value:,.1f}")

# async def rest_day(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     if update.effective_chat is None or update.effective_user is None:
#         logging.error(f"Invalid update object, missing effective chat or user: {update}")
#         return

    user = FitnessUser.load_user(update.effective_user.id)
    if not user:
        await context.bot.send_message(chat_id=update.effective_chat.id, text="You're not part of the challenge yet. Use /join to join the challenge.")
        return

    # Here you would implement the logic to mark a rest day
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Rest day marked. Remember to get back to running tomorrow!")

async def show_rules(update: Update, context: ContextTypes.DEFAULT_TYPE):
    rules = """
    🏃‍♂️ Fitness Challenge Rules 🏃‍♀️

    1. Stake at least 0.01 ETH to join the challenge. 
    2. Run at least 1 km every day for 30 days.
    2. Submit your run by midnight.
    3. You can use up to 4 rest days, if you miss more than 4 days, you're out of the challenge.
    5. The winners are determined by the total km run. Top three will get extra award from the slashed pool.
    6. You can withdraw your ETH at the end of the challenge.

    Good luck 🍀 and have fun! 
    """
    await context.bot.send_message(chat_id=update.effective_chat.id, text=rules)

async def show_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
    Available commands:
    /join - Join the challenge
    /submit - Submit your "proof-of-run"
    /leaderboard - View the current leaderboard
    /reward - Check your current reward
    /rules - View the challenge rules
    /help - Show this help message

    To submit your daily run, simply send a screenshot of your running app.
    """
    await context.bot.send_message(chat_id=update.effective_chat.id, text=help_text)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_message = "Welcome to the Fitness Challenge Bot! To get started, use the /join command to join the challenge."
    await context.bot.send_message(chat_id=update.effective_chat.id, text=welcome_message)

def evaluate_screenshot(image_url):
    try:
        # Get the current time from the system
        current_time = datetime.now()
        
        print(f"Current time: {current_time}")

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]}
            ],
            max_tokens=300,
        )
        bot_response = response.choices[0].message.content
        print(f"Bot response: {bot_response}")
        
        # Use regex to extract the JSON part
        json_match = re.search(r'\{.*\}', bot_response, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            evaluation_dict = json.loads(json_str)
            run_evaluation = RunEvaluation(**evaluation_dict)
            
            # Check the date
            current_time = datetime.now()
            if run_evaluation.date:
                try:
                    run_date = datetime.strptime(run_evaluation.date, "%Y-%m-%d %H:%M")
                    
                    # Check if the run date is in the future
                    if run_date > current_time:
                        run_evaluation.valid = False
                        run_evaluation.message = "The submitted run date is in the future. Please check the date and try again."
                    # Check if the run date is within the last 24 hours
                    elif current_time - run_date > timedelta(hours=24):
                        run_evaluation.valid = False
                        run_evaluation.message = "The submitted run is more than 24 hours old. Please submit a recent run."
                    # If the date is today or yesterday, it's valid
                    elif run_date.date() in [current_time.date(), (current_time - timedelta(days=1)).date()]:
                        run_evaluation.valid = True
                        run_evaluation.message += " The run date is valid."
                    else:
                        run_evaluation.valid = False
                        run_evaluation.message = "The run date is not within the acceptable range. Please submit a run from today or yesterday."
                except ValueError:
                    run_evaluation.valid = False
                    run_evaluation.message = "Invalid date format. Please ensure the date is in the correct format."
            else:
                run_evaluation.valid = False
                run_evaluation.message = "No date provided. Please ensure the screenshot includes the date of the run."
            
            return run_evaluation
        else:
            print(f"No JSON found in the response: {bot_response}")
            return RunEvaluation(date="", valid=False, kilometers=0.0, message="Error parsing the response. Please try again.")

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return RunEvaluation(date="", valid=False, kilometers=0.0, message="Error parsing the response. Please try again.")
    except Exception as e:
        print(f"Error processing screenshot: {e}")
        return RunEvaluation(date="", valid=False, kilometers=0.0, message="Error processing your screenshot. Please try again.")

async def send_daily_motivation(context: ContextTypes.DEFAULT_TYPE):
    logging.info("Sending daily motivation messages")
    motivational_quotes = [
        "I'm not running away from my problems, I'm running away from my calories.",
        "Sweat, smile, repeat. Each day brings you closer to greatness.",
        "Every kilometer is a step toward a stronger mind, body, and soul.",
        "The only bad workout is the one that didn't happen.",
        "You're not just running—you're collecting high-fives from your future self.",
        "Running Rule #1: Don't trip. Rule #2: Don't quit. Rule #3: By day 28, laugh, cry, or do both—whatever gets you to the finish line!"
    ]

    for user_file in os.listdir('data/fitness_users'):
        user_id = int(user_file.split('.')[0])
        user = FitnessUser.load_user(user_id)
        if user:
            quote = random.choice(motivational_quotes)
            days_since_join = (datetime.now().date() - user.join_date).days + 1
            
            if user.last_run_date != datetime.now().date() - timedelta(days=1):
                if user.rest_days < 4:
                    message = f"Good morning, @{user.username}! It looks like you took a rest yesterday. You have {4 - user.rest_days} rest days remaining."
                    user.add_rest_day()
                elif user.rest_days == 4:
                    message = f"Good morning, @{user.username}! You have used up all your rest days. Don't miss the next upload or you'll get slashed!"
                else:
                    message = f"Sorry, @{user.username}. You didn't make it in this challenge. See you next time!"
            else:
                message = f"Good morning, @{user.username}! Rise and shine! It's day {days_since_join} of the Stake & Run Challenge. You're doing great! Keep it up!\n\n{quote}\n\nRemember to submit your proof-of-run within 24 hours if you've completed your run yesterday."

            await context.bot.send_message(chat_id=user_id, text=message)
            user.save_user()

async def send_typing_action(context: ContextTypes.DEFAULT_TYPE, chat_id: int):
    await context.bot.send_chat_action(chat_id=chat_id, action=telegram.constants.ChatAction.TYPING)

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    print('Handle Photo')
    if update.effective_chat is None or update.effective_user is None or update.message is None or update.message.photo is None:
        logging.error(f"Invalid update object: {update}")
        return

    await send_typing_action(context, update.effective_chat.id)

    user = FitnessUser.load_user(update.effective_user.id)
    if not user:
        await context.bot.send_message(chat_id=update.effective_chat.id, text="You're not part of the challenge yet. Use /join to join the challenge.")
        return

    # Get the largest photo (best quality)
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    file_bytes = await file.download_as_bytearray()
    image_base64 = base64.b64encode(file_bytes).decode('utf-8')
    file_type = file.file_path.split('.')[-1]
    encoded_image = f"data:image/{file_type};base64,{image_base64}"
    print(encoded_image)

    # Send typing action again before evaluating screenshot
    await send_typing_action(context, update.effective_chat.id)

    result = evaluate_screenshot(encoded_image)
    # TODO check the date is correct and within 24 hours
    if result.valid:
        user.add_run(result.kilometers)
        user.save_user()
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=f"{result.message}\nYou have completed {user.valid_days} days so far. Keep it up! Check out the Leaderboard to see your ranking.",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Leaderboard", callback_data="leaderboard")]])
        )
    else:
        await context.bot.send_message(chat_id=update.effective_chat.id, text=result.message)

async def button_click(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.callback_query is None:
        logging.error(f"Invalid update object, missing callback query: {update}")
        return

    query = update.callback_query
    await query.answer()

    if query.data == "leaderboard":
        await show_leaderboard(update, context)








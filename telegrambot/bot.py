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

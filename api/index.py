from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app import (
    agent,
    AgentImage,
    calculate,
    get_current_time_in_timezone,
)
from PIL import Image
import io
import base64
import re
import time

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware


app = FastAPI()


# ---------------------------------------------------------
# RATE LIMITER
# ---------------------------------------------------------

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-research-agent-b7eucwr0i-haiqa1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class ChatRequest(BaseModel):
    message: str


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------

@app.get("/")
def home():
    return {
        "status": "Agentia backend is running"
    }


# ---------------------------------------------------------
# IMAGE → BASE64
# ---------------------------------------------------------

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL image to browser-compatible data URI."""

    buffer = io.BytesIO()

    image.save(
        buffer,
        format="PNG"
    )

    image_base64 = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    return f"data:image/png;base64,{image_base64}"


# ---------------------------------------------------------
# CALCULATION DETECTION
# ---------------------------------------------------------

def is_simple_calculation(message: str) -> bool:
    """
    Detect simple mathematical expressions.

    Examples:
    25 * 4
    100 / 5
    25 * 4 + 10
    """

    text = message.strip().lower()

    # Remove common calculation wording
    text = re.sub(
        r"^(calculate|compute|what is|what's)\s+",
        "",
        text,
    )

    # Only allow numbers and basic arithmetic operators
    return bool(
        re.fullmatch(
            r"[0-9\s\+\-\*\/\(\)\.\%]+",
            text,
        )
    )


# ---------------------------------------------------------
# EXTRACT CALCULATION
# ---------------------------------------------------------

def extract_calculation(message: str) -> str:

    text = message.strip().lower()

    text = re.sub(
        r"^(calculate|compute|what is|what's)\s+",
        "",
        text,
    )

    return text


# ---------------------------------------------------------
# TIMEZONE DETECTION
# ---------------------------------------------------------

def detect_timezone(message: str):
    """
    Fast path for common timezone requests.

    Returns:
        timezone string or None
    """

    text = message.lower()

    timezone_map = {
        "turkey": "Europe/Istanbul",
        "istanbul": "Europe/Istanbul",

        "london": "Europe/London",
        "uk": "Europe/London",

        "dubai": "Asia/Dubai",
        "uae": "Asia/Dubai",

        "tokyo": "Asia/Tokyo",
        "japan": "Asia/Tokyo",

        "new york": "America/New_York",

        "los angeles": "America/Los_Angeles",
        "california": "America/Los_Angeles",

        "paris": "Europe/Paris",

        "germany": "Europe/Berlin",
        "berlin": "Europe/Berlin",

        "pakistan": "Asia/Karachi",
        "lahore": "Asia/Karachi",
        "karachi": "Asia/Karachi",

        "india": "Asia/Kolkata",
        "delhi": "Asia/Kolkata",

        "sydney": "Australia/Sydney",
        "australia": "Australia/Sydney",
    }

    time_words = [
        "time",
        "current time",
        "what time",
        "what's the time",
    ]

    if not any(word in text for word in time_words):
        return None

    for location, timezone in timezone_map.items():

        if location in text:
            return timezone

    return None


# ---------------------------------------------------------
# GREETING DETECTION
# ---------------------------------------------------------

def is_greeting(message: str) -> bool:

    text = message.strip().lower()

    greetings = {
        "hi",
        "hello",
        "hey",
        "hiya",
        "good morning",
        "good afternoon",
        "good evening",
    }

    return text in greetings


# ---------------------------------------------------------
# CHAT ENDPOINT
# ---------------------------------------------------------

@app.post("/chat")
@limiter.limit("10/day")
def chat(request: Request, chat_request: ChatRequest):

    start = time.perf_counter()

    message = chat_request.message.strip()

    if not message:

        return {
            "type": "text",
            "response": "Please enter a message.",
        }


    # -----------------------------------------------------
    # FAST PATH 1 — GREETINGS
    # -----------------------------------------------------

    if is_greeting(message):

        elapsed = time.perf_counter() - start

        print(
            f"[FAST] Greeting: {elapsed:.3f}s"
        )

        return {
            "type": "text",
            "response": "Hello! How can I assist you today?",
        }


    # -----------------------------------------------------
    # FAST PATH 2 — CALCULATIONS
    # -----------------------------------------------------

    if is_simple_calculation(message):

        expression = extract_calculation(message)

        result = calculate(expression)

        elapsed = time.perf_counter() - start

        print(
            f"[FAST] Calculation: {elapsed:.3f}s"
        )

        return {
            "type": "text",
            "response": result,
        }


    # -----------------------------------------------------
    # FAST PATH 3 — TIME
    # -----------------------------------------------------

    timezone = detect_timezone(message)

    if timezone:

        result = get_current_time_in_timezone(
            timezone
        )

        elapsed = time.perf_counter() - start

        print(
            f"[FAST] Time: {elapsed:.3f}s"
        )

        return {
            "type": "text",
            "response": result,
        }


    # -----------------------------------------------------
    # NORMAL AGENT PATH
    # -----------------------------------------------------

    print(
        "[AGENT] Sending request to CodeAgent..."
    )

    response = agent.run(message)


    # -----------------------------------------------------
    # IMAGE RESPONSE
    # -----------------------------------------------------

    if isinstance(response, AgentImage):

        response = response.to_raw()


    if isinstance(response, Image.Image):

        image_data = image_to_base64(
            response
        )

        elapsed = time.perf_counter() - start

        print(
            f"[AGENT] Image response: {elapsed:.3f}s"
        )

        return {
            "type": "image",
            "response": image_data,
        }


    # -----------------------------------------------------
    # TEXT RESPONSE
    # -----------------------------------------------------

    elapsed = time.perf_counter() - start

    print(
        f"[AGENT] Text response: {elapsed:.3f}s"
    )

    return {
        "type": "text",
        "response": str(response),
    }
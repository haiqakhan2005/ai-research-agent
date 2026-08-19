from smolagents import (
    CodeAgent,
    OpenAIServerModel,
    DuckDuckGoSearchTool,
    FinalAnswerTool,
    tool,
    load_tool,
    AgentImage,
)
import datetime
import pytz
import os
from dotenv import load_dotenv
# import yaml


load_dotenv()

print("HF_TOKEN exists:", bool(os.getenv("HF_TOKEN")))
print("GEMINI_API_KEY exists:", bool(os.getenv("GEMINI_API_KEY")))

search_tool = DuckDuckGoSearchTool()
final_answer = FinalAnswerTool()

image_generation_tool = load_tool(
    "agents-course/text-to-image",
    token=os.getenv("HF_TOKEN"),
    trust_remote_code=True
)

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression.

    Args:
        expression: A mathematical expression such as '25 * 4 + 10'.

    Returns:
        The result of the calculation.
    """
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Error calculating expression: {str(e)}"

@tool
def get_current_time_in_timezone(timezone: str) -> str:
    """Get the current local time in a specified timezone.

    Args:
        timezone: A valid timezone such as 'Asia/Tokyo' or 'Europe/London'.

    Returns:
        The current local time in the specified timezone.
    """
    try:
        tz = pytz.timezone(timezone)

        local_time = datetime.datetime.now(tz).strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        return f"The current local time in {timezone} is: {local_time}"

    except Exception as e:
        return f"Error fetching time for timezone '{timezone}': {str(e)}"

model = OpenAIServerModel(
    model_id="gemini-3.6-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
    api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
    max_tokens=2096,
    temperature=0.2,
)

agent = CodeAgent(
    model=model,
    tools=[
        get_current_time_in_timezone,
        calculate,
        search_tool,
        final_answer,
        image_generation_tool
    ],
    max_steps=6,
    verbosity_level=2,
)
# print("Agent created successfully!")

# response = agent.run(
#     " The current time in Lahore and Calculate 25 * 4 + 10.",
   
# )
# print(response)


# for step in response:
#     print(step)

# response = agent.run(
#     """Search the web and explain what Hugging Face is.

# Include:
# 1. What Hugging Face is
# 2. What the Hugging Face Hub is
# 3. What Models and Datasets are
# 4. What Spaces are used for
# 5. Why developers use Hugging Face
# """
# )

# print(response)

# response = agent.run(
#     "Generate an image of a cute puppy sitting on the moon."
# )

# print(response)

import gradio as gr
from PIL import Image


def run_agent(message):
    response = agent.run(message)

    if isinstance(response, AgentImage):
        return "", response.to_raw()

    return str(response), None

demo = gr.Interface(
    fn=run_agent,
    inputs=gr.Textbox(
        label="Ask the Agent",
        placeholder="Ask me anything..."
    ),
    outputs=[
    gr.Markdown(label="Agent Response"),
    gr.Image(label="Generated Image")
    ],
    title="Haiqa's AI Agent",
    description="A multipurpose AI agent powered by Qwen and smolagents."
)

if __name__ == "__main__":
    demo.launch()
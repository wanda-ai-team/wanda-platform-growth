from transformers import OpenAiAgent
from transformers import load_tool

tool = load_tool("text-summarization")
summarization = tool("This is a text summarization tool")
agent = OpenAiAgent(model="text-davinci-003", api_key="<your_api_key>")

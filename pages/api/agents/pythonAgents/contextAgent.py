from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatAnthropic
from langchain.agents.agent_toolkits import PlayWrightBrowserToolkit
from langchain.tools.playwright.utils import (
    create_async_playwright_browser,
    create_sync_playwright_browser,# A synchronous browser is available, though it isn't compatible with jupyter.
)

from langchain.llms import OpenAI

llm = OpenAI(temperature=0)

async_browser = create_async_playwright_browser()
toolkit = PlayWrightBrowserToolkit.from_browser(async_browser=async_browser)
tools = toolkit.get_tools()

agent_chain = initialize_agent(tools, llm, agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
result = agent_chain.arun("What are the headers on langchain.com?")
print(result)
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    # Anthropic
    api_key: str = field(default_factory=lambda: os.environ.get("ANTHROPIC_API_KEY", ""))
    model: str = "claude-sonnet-4-6"
    max_tokens: int = 2048
    temperature: float = 0.7

    # Storage
    data_dir: str = field(default_factory=lambda: os.environ.get("DATA_DIR", "./data"))

    # Search
    tavily_api_key: str = field(default_factory=lambda: os.environ.get("TAVILY_API_KEY", ""))

    # Conversation limits
    max_conversation_turns: int = 60
    profile_extraction_every_n_turns: int = 3

    # Prompt caching (dramatically reduces cost at scale)
    enable_prompt_caching: bool = True

    # Tool loop
    max_tool_iterations: int = 5


def get_config() -> Config:
    return Config()

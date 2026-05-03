"""
tools/ — Advisor tool definitions and implementations.

  schemas.py   Tool JSON schemas in Anthropic function-calling format.
               Import ADVISOR_TOOLS and pass to client.messages.create(tools=...).

  search.py    Real-time search implementations (universities, careers, scholarships).
               Uses Tavily as primary search backend; duckduckgo-search as fallback.

  profile.py   Student profile and session CRUD on top of the file-based session store.

Emergent Agent integration:
    from tools.schemas import ADVISOR_TOOLS
    from tools.search import execute_tool
"""
from tools.schemas import ADVISOR_TOOLS
from tools.search import execute_tool

__all__ = ["ADVISOR_TOOLS", "execute_tool"]

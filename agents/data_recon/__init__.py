"""RANGER Data Reconnaissance Agent Team package."""
__all__ = ["root_agent"]


def __getattr__(name):
    """Lazy load root_agent to avoid import errors during testing."""
    if name == "root_agent":
        from .agent import root_agent
        return root_agent
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

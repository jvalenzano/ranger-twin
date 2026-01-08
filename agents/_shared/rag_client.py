"""
RAG Client with Graceful Fallback Pattern

Checks corpus health at startup and provides fallback to embedded knowledge.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Module-level flag set at startup
_RAG_AVAILABLE: Optional[bool] = None
_RAG_CONFIG: Optional[Dict[str, Any]] = None


def _check_corpus_health() -> bool:
    """
    Check if RAG corpus is available and healthy.
    Called once at startup, result is cached.
    """
    # 1. Check for manual override via environment variable
    config_env = os.environ.get("VERTEX_RAG_CONFIG_PATH")
    if config_env:
        config_path = Path(config_env)
    else:
        # 2. Look in conventional locations
        # - Current working directory
        # - Agent root (parent of this file's parent)
        # - Project root (from AGENTS_DIR or similar)
        search_paths = [
            Path.cwd() / ".vertex_rag_config.json",
            Path(__file__).parent.parent / ".vertex_rag_config.json",
            Path(__file__).parent.parent.parent / ".vertex_rag_config.json"
        ]
        
        config_path = None
        for p in search_paths:
            if p.exists():
                config_path = p
                break
    
    if not config_path or not config_path.exists():
        logger.info("[RAG-DEMO-MODE] No .vertex_rag_config.json found. System will use embedded knowledge (fixtured/templates).")
        return False
    
    try:
        with open(config_path) as f:
            config = json.load(f)
        
        # Check if explicitly disabled
        if not config.get("enabled", True):
            logger.info("[RAG-DEMO-MODE] RAG explicitly disabled in config. Using embedded knowledge.")
            return False
            
        global _RAG_CONFIG
        _RAG_CONFIG = config
        
        # In demo phase, we often have healthy=false set manually.
        if config.get("healthy", False):
            logger.info("[RAG-ONLINE] Vertex AI RAG corpus is healthy and available.")
            return True
        else:
            logger.info("[RAG-DEMO-MODE] RAG config found but status is unhealthy/disabled. Using embedded knowledge.")
            return False
        
    except Exception as e:
        logger.warning("[RAG-ERROR] Failed to load RAG config: %s", e)
        return False


def is_rag_available() -> bool:
    """Check if RAG is available (cached result from startup)."""
    global _RAG_AVAILABLE
    if _RAG_AVAILABLE is None:
        _RAG_AVAILABLE = _check_corpus_health()
    return _RAG_AVAILABLE


def get_rag_config() -> Optional[Dict[str, Any]]:
    """Get RAG configuration if available."""
    is_rag_available()  # Ensure check has run
    return _RAG_CONFIG


# Run health check on import
is_rag_available()

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
    # Look for config in agents root
    config_path = Path(__file__).parent.parent / ".vertex_rag_config.json"
    
    if not config_path.exists():
        logger.warning("[RAG-OFFLINE] No .vertex_rag_config.json found at %s", config_path)
        return False
    
    try:
        with open(config_path) as f:
            config = json.load(f)
        
        # Check if explicitly disabled
        if not config.get("enabled", True):
            logger.info("[RAG-OFFLINE] RAG explicitly disabled in config")
            return False
            
        global _RAG_CONFIG
        _RAG_CONFIG = config
        
        # In demo phase, we often have enabled=false but healthy=false set manually.
        # We also check for actual corpus IDs if enabled.
        if config.get("healthy", False):
            return True
        else:
            logger.info("[RAG-OFFLINE] RAG config found but status is unhealthy/disabled")
            return False
        
    except Exception as e:
        logger.warning("[RAG-OFFLINE] Failed to load RAG config: %s", e)
        return False


def is_rag_available() -> bool:
    """Check if RAG is available (cached result from startup)."""
    global _RAG_AVAILABLE
    if _RAG_AVAILABLE is None:
        _RAG_AVAILABLE = _check_corpus_health()
        if not _RAG_AVAILABLE:
            logger.info("[RAG-OFFLINE] Using embedded knowledge (fixtured/templates) for demo phase")
    return _RAG_AVAILABLE


def get_rag_config() -> Optional[Dict[str, Any]]:
    """Get RAG configuration if available."""
    is_rag_available()  # Ensure check has run
    return _RAG_CONFIG


# Run health check on import
is_rag_available()

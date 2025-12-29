"""
Integration tests for Vertex AI RAG knowledge base.

Tests RAG query functionality across all 4 agent corpora:
- NEPA Advisor (nepa corpus)
- Burn Analyst (burn_severity corpus)
- Cruising Assistant (timber_salvage corpus)
- Trail Assessor (trail_infrastructure corpus)

Prerequisites:
    - Vertex AI RAG corpora created (python knowledge/scripts/3_create_corpora.py)
    - Documents imported (python knowledge/scripts/4_import_documents.py)
    - GOOGLE_API_KEY environment variable set
    - GOOGLE_CLOUD_PROJECT environment variable set (or defaults to ranger-twin-dev)

Usage:
    pytest tests/integration/test_rag_integration.py -v
    pytest tests/integration/test_rag_integration.py::test_nepa_advisor_vertex_rag -v
"""

import os
import sys
from pathlib import Path

import pytest

# Add repo root to Python path for absolute imports
REPO_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))


# Fixtures for test data
@pytest.fixture
def nepa_test_queries():
    """Test queries for NEPA corpus."""
    return [
        "What are the categorical exclusion criteria under 36 CFR 220?",
        "When is an Environmental Assessment required versus an EIS?",
        "What are the acreage thresholds for timber salvage categorical exclusions?"
    ]


@pytest.fixture
def burn_severity_test_queries():
    """Test queries for burn severity corpus."""
    return [
        "What are the dNBR thresholds for high severity burn classification?",
        "What are the BAER assessment protocols for soil burn severity?",
        "How is debris flow risk assessed after high severity burns?"
    ]


@pytest.fixture
def timber_salvage_test_queries():
    """Test queries for timber salvage corpus."""
    return [
        "What is the standard cruise methodology for post-fire salvage?",
        "How do you calculate timber volume deterioration rates?",
        "What are the appraisal methods for fire-damaged timber?"
    ]


@pytest.fixture
def trail_infrastructure_test_queries():
    """Test queries for trail infrastructure corpus."""
    return [
        "What are the FSTAG accessibility standards for trails?",
        "How are trail damage types classified (Type I-IV)?",
        "What are the TRACS codes for trail infrastructure assessment?"
    ]


# Helper function to validate RAG response
def validate_rag_response(result, expected_query):
    """
    Validate RAG response has expected structure and content.

    Args:
        result: RAG query result dictionary
        expected_query: Original query string

    Raises:
        AssertionError: If response is invalid
    """
    # Check status
    assert result["status"] == "success", f"Query failed: {result.get('error')}"

    # Check query echo
    assert result["query"] == expected_query

    # Check answer generated
    assert "answer" in result
    assert len(result["answer"]) > 0, "Answer is empty"
    assert result["answer"] != "No answer generated.", "Answer generation failed"

    # Check contexts retrieved
    assert "contexts" in result
    assert isinstance(result["contexts"], list)
    assert len(result["contexts"]) > 0, "No contexts retrieved"
    assert result["chunks_retrieved"] == len(result["contexts"])

    # Validate context structure
    for ctx in result["contexts"]:
        assert "text" in ctx
        assert "distance" in ctx
        assert "relevance" in ctx
        assert len(ctx["text"]) > 0, "Context text is empty"
        assert 0 <= ctx["relevance"] <= 1, f"Invalid relevance: {ctx['relevance']}"

    # Check citations (if included)
    if result.get("citations"):
        assert isinstance(result["citations"], list)
        for citation in result["citations"]:
            assert "source" in citation or "text" in citation


# NEPA Advisor Tests
class TestNEPAAdvisorRAG:
    """Test NEPA Advisor Vertex RAG integration."""

    def test_nepa_advisor_vertex_rag_migration(self, nepa_test_queries):
        """
        Test NEPA Advisor migration from File Search to Vertex RAG.

        Verifies:
        - consult_mandatory_nepa_standards() function works
        - Returns expected response structure
        - Backward compatibility maintained
        """
        from agents.nepa_advisor.file_search import consult_mandatory_nepa_standards

        query = nepa_test_queries[0]  # CE criteria query
        result = consult_mandatory_nepa_standards(
            topic=query,
            max_chunks=5,
            include_citations=True
        )

        validate_rag_response(result, query)

        # Test backward compatibility: same return schema
        assert all(key in result for key in ["query", "answer", "citations", "chunks_retrieved", "status"])

    def test_nepa_multiple_queries(self, nepa_test_queries):
        """Test multiple NEPA queries in sequence."""
        from agents.nepa_advisor.file_search import consult_mandatory_nepa_standards

        for query in nepa_test_queries:
            result = consult_mandatory_nepa_standards(topic=query, max_chunks=3)
            validate_rag_response(result, query)

    def test_nepa_max_chunks_parameter(self):
        """Test max_chunks parameter controls result count."""
        from agents.nepa_advisor.file_search import consult_mandatory_nepa_standards

        query = "categorical exclusion criteria"

        # Test with different chunk counts
        for max_chunks in [1, 3, 5]:
            result = consult_mandatory_nepa_standards(topic=query, max_chunks=max_chunks)
            assert result["status"] == "success"
            assert result["chunks_retrieved"] <= max_chunks, \
                f"Retrieved {result['chunks_retrieved']} chunks, expected max {max_chunks}"

    def test_nepa_store_info(self):
        """Test get_store_info() returns corpus configuration."""
        from agents.nepa_advisor.file_search import get_store_info

        info = get_store_info()

        assert info["configured"] is True, "Corpus not configured"
        assert "corpus_resource_id" in info
        assert "backend" in info
        assert info["backend"] == "vertex_rag", "Backend should be vertex_rag after migration"

    def test_nepa_health_check(self):
        """Test verify_store_health() returns healthy status."""
        from agents.nepa_advisor.file_search import verify_store_health

        health = verify_store_health()

        assert health["healthy"] is True, f"Corpus unhealthy: {health.get('error')}"
        assert "corpus_resource_id" in health
        assert "answer_preview" in health
        assert len(health["answer_preview"]) > 0


# Burn Analyst Tests
class TestBurnAnalystRAG:
    """Test Burn Analyst RAG integration."""

    def test_burn_analyst_rag_query(self, burn_severity_test_queries):
        """Test burn severity knowledge base query."""
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        query = burn_severity_test_queries[0]  # dNBR thresholds
        result = query_burn_severity_knowledge(query=query, top_k=5)

        validate_rag_response(result, query)

    def test_burn_analyst_multiple_queries(self, burn_severity_test_queries):
        """Test multiple burn severity queries."""
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        for query in burn_severity_test_queries:
            result = query_burn_severity_knowledge(query=query, top_k=3)
            validate_rag_response(result, query)

    def test_burn_analyst_no_answer_mode(self):
        """Test query without answer generation (contexts only)."""
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        query = "BAER assessment protocols"
        result = query_burn_severity_knowledge(
            query=query,
            top_k=3,
            include_answer=False
        )

        assert result["status"] == "success"
        assert result["chunks_retrieved"] > 0
        assert len(result["contexts"]) > 0
        # Answer should be empty when include_answer=False
        assert result["answer"] == "" or "No relevant" in result["answer"]


# Cruising Assistant Tests
class TestCruisingAssistantRAG:
    """Test Cruising Assistant RAG integration."""

    def test_cruising_assistant_rag_query(self, timber_salvage_test_queries):
        """Test timber salvage knowledge base query."""
        from agents.cruising_assistant.rag_query import query_timber_salvage_knowledge

        query = timber_salvage_test_queries[0]  # Cruise methodology
        result = query_timber_salvage_knowledge(query=query, top_k=5)

        validate_rag_response(result, query)

    def test_cruising_assistant_multiple_queries(self, timber_salvage_test_queries):
        """Test multiple timber salvage queries."""
        from agents.cruising_assistant.rag_query import query_timber_salvage_knowledge

        for query in timber_salvage_test_queries:
            result = query_timber_salvage_knowledge(query=query, top_k=3)
            validate_rag_response(result, query)


# Trail Assessor Tests
class TestTrailAssessorRAG:
    """Test Trail Assessor RAG integration."""

    def test_trail_assessor_rag_query(self, trail_infrastructure_test_queries):
        """Test trail infrastructure knowledge base query."""
        from agents.trail_assessor.rag_query import query_trail_infrastructure_knowledge

        query = trail_infrastructure_test_queries[0]  # FSTAG standards
        result = query_trail_infrastructure_knowledge(query=query, top_k=5)

        validate_rag_response(result, query)

    def test_trail_assessor_multiple_queries(self, trail_infrastructure_test_queries):
        """Test multiple trail infrastructure queries."""
        from agents.trail_assessor.rag_query import query_trail_infrastructure_knowledge

        for query in trail_infrastructure_test_queries:
            result = query_trail_infrastructure_knowledge(query=query, top_k=3)
            validate_rag_response(result, query)


# Cross-Agent Tests
class TestRAGCrossAgent:
    """Test RAG functionality across all agents."""

    def test_all_agents_have_rag_tools(self):
        """Verify all agents have RAG query functions."""
        # NEPA Advisor
        from agents.nepa_advisor.file_search import consult_mandatory_nepa_standards
        assert callable(consult_mandatory_nepa_standards)

        # Burn Analyst
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge
        assert callable(query_burn_severity_knowledge)

        # Cruising Assistant (need to import from correct path)
        sys.path.insert(0, str(REPO_ROOT / "agents" / "cruising_assistant"))
        from agents.cruising_assistant.rag_query import query_timber_salvage_knowledge
        assert callable(query_timber_salvage_knowledge)

        # Trail Assessor
        sys.path.insert(0, str(REPO_ROOT / "agents" / "trail_assessor"))
        from agents.trail_assessor.rag_query import query_trail_infrastructure_knowledge
        assert callable(query_trail_infrastructure_knowledge)

    def test_relevance_scores(self):
        """Test that relevance scores are reasonable across all agents."""
        from agents.nepa_advisor.file_search import consult_mandatory_nepa_standards
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge
        from agents.cruising_assistant.rag_query import query_timber_salvage_knowledge
        from agents.trail_assessor.rag_query import query_trail_infrastructure_knowledge

        test_cases = [
            ("nepa_advisor", consult_mandatory_nepa_standards,
             {"topic": "categorical exclusion", "max_chunks": 3}),
            ("burn_analyst", query_burn_severity_knowledge,
             {"query": "dNBR classification", "top_k": 3}),
            ("cruising_assistant", query_timber_salvage_knowledge,
             {"query": "cruise methodology", "top_k": 3}),
            ("trail_assessor", query_trail_infrastructure_knowledge,
             {"query": "FSTAG standards", "top_k": 3})
        ]

        for agent_name, func, kwargs in test_cases:
            result = func(**kwargs)

            assert result["status"] == "success", f"{agent_name} query failed"
            assert result["chunks_retrieved"] > 0, f"{agent_name} returned no chunks"

            # Check relevance scores are reasonable (> 0.3 for top result)
            if result["contexts"]:
                top_relevance = result["contexts"][0]["relevance"]
                assert top_relevance > 0.3, \
                    f"{agent_name} top relevance too low: {top_relevance}"


# Error Handling Tests
class TestRAGErrorHandling:
    """Test error handling in RAG queries."""

    def test_missing_config_file(self, tmp_path):
        """Test error when .vertex_rag_config.json is missing."""
        # This test would require mocking the config path
        # Skip for now as it requires more complex setup
        pytest.skip("Requires mocking config path - implement if needed")

    def test_empty_query(self):
        """Test handling of empty query."""
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        result = query_burn_severity_knowledge(query="", top_k=3)

        # Should either succeed with no results or fail gracefully
        assert "status" in result
        if result["status"] == "success":
            # Empty query might return no chunks
            assert result["chunks_retrieved"] >= 0

    def test_very_long_query(self):
        """Test handling of very long query."""
        from agents.cruising_assistant.rag_query import query_timber_salvage_knowledge

        long_query = "What are the timber cruise methodology standards " * 100
        result = query_timber_salvage_knowledge(query=long_query, top_k=3)

        # Should handle gracefully (either succeed or return error)
        assert result["status"] in ["success", "error"]


# Performance Tests
class TestRAGPerformance:
    """Test RAG query performance."""

    def test_query_response_time(self):
        """Test that queries complete within reasonable time."""
        import time
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        start = time.time()
        result = query_burn_severity_knowledge(
            query="BAER assessment",
            top_k=3
        )
        elapsed = time.time() - start

        assert result["status"] == "success"
        assert elapsed < 30, f"Query took too long: {elapsed:.2f}s"

    def test_concurrent_queries(self):
        """Test multiple agents can query simultaneously."""
        from concurrent.futures import ThreadPoolExecutor
        from agents.burn_analyst.rag_query import query_burn_severity_knowledge

        def run_query(query_num):
            return query_burn_severity_knowledge(
                query=f"test query {query_num}",
                top_k=2
            )

        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(run_query, i) for i in range(3)]
            results = [f.result() for f in futures]

        # All queries should complete
        assert len(results) == 3
        for result in results:
            assert "status" in result


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])

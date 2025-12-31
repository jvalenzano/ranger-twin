#!/usr/bin/env python3
"""
RANGER Agent Stress Test Harness

Automated testing via ADK API Server endpoints.
Run with: python agent_stress_test.py --matrix ../tests/stress_test_matrix.yaml
"""

import asyncio
import argparse
import json
import re
import uuid
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

import httpx
import yaml
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()


@dataclass
class EventAnalysis:
    """Extracted diagnostics from ADK event stream."""
    agents_involved: list[str] = field(default_factory=list)
    tool_calls: list[dict] = field(default_factory=list)
    tool_responses: list[dict] = field(default_factory=list)
    final_text: str = ""
    raw_events: list[dict] = field(default_factory=list)
    total_time_ms: float = 0
    error: Optional[str] = None


@dataclass 
class ValidationResult:
    """Result of validating response against expected criteria."""
    passed: bool
    failures: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


@dataclass
class TestResult:
    """Complete result for a single test."""
    test_id: str
    agent: str
    query: str
    passed: bool
    analysis: EventAnalysis
    validation: ValidationResult
    duration_seconds: float


def analyze_events(events: list[dict]) -> EventAnalysis:
    """Extract diagnostic info from ADK event stream."""
    analysis = EventAnalysis(raw_events=events)
    
    for event in events:
        # Track which agents participated
        author = event.get("author", "")
        if author and author not in analysis.agents_involved:
            analysis.agents_involved.append(author)
        
        # Look for tool calls in content
        content = event.get("content", {})
        if content:
            parts = content.get("parts", [])
            for part in parts:
                if "functionCall" in part:
                    analysis.tool_calls.append(part["functionCall"])
                if "functionResponse" in part:
                    analysis.tool_responses.append(part["functionResponse"])
                if "text" in part:
                    # Accumulate text (last one is usually final)
                    analysis.final_text = part["text"]
    
    return analysis


def validate_response(analysis: EventAnalysis, expected: dict) -> ValidationResult:
    """Check response against expected criteria."""
    failures = []
    warnings = []
    text_lower = analysis.final_text.lower()
    
    # Check for empty response
    if expected.get("response_not_empty") and not analysis.final_text.strip():
        failures.append("Response is empty")
        return ValidationResult(passed=False, failures=failures)
    
    # Check for error
    if analysis.error:
        failures.append(f"Error occurred: {analysis.error}")
        return ValidationResult(passed=False, failures=failures)
    
    # Text content checks
    if "contains_any" in expected:
        terms = expected["contains_any"]
        if not any(term.lower() in text_lower for term in terms):
            failures.append(f"Missing expected terms (need any of): {terms}")
    
    if "contains_all" in expected:
        terms = expected["contains_all"]
        missing = [t for t in terms if t.lower() not in text_lower]
        if missing:
            failures.append(f"Missing required terms: {missing}")
    
    # Citation checks
    if expected.get("has_citations"):
        citation_patterns = [
            r'\[.*?\]',
            r'FSM\s*\d+',
            r'FSH\s*[\d.]+',
            r'36\s*CFR',
            r'\(.*?citation.*?\)',
        ]
        has_citation = any(re.search(p, analysis.final_text, re.IGNORECASE) for p in citation_patterns)
        if not has_citation:
            warnings.append("No obvious citations found in response")
    
    if "citation_pattern" in expected:
        pattern = expected["citation_pattern"]
        if not re.search(pattern, analysis.final_text, re.IGNORECASE):
            failures.append(f"Missing citation matching pattern: {pattern}")
    
    # Delegation checks - detect AgentTool calls by functionCall.name
    if "delegation_to" in expected:
        expected_agents = set(expected["delegation_to"])
        found_agents = set()
        
        # Method 1: Check function calls for agent tool names
        for call in analysis.tool_calls:
            call_name = call.get("name", "").lower().replace("_", "")
            for agent in expected_agents:
                normalized_agent = agent.lower().replace("_", "")
                if normalized_agent in call_name or call_name in normalized_agent:
                    found_agents.add(agent)
        
        # Method 2: Also check agents_involved for direct mentions
        for agent in expected_agents:
            normalized_agent = agent.lower().replace("_", "")
            for involved in analysis.agents_involved:
                if normalized_agent in involved.lower().replace("_", ""):
                    found_agents.add(agent)
        
        missing = expected_agents - found_agents
        if missing:
            tool_names = [c.get("name", "?") for c in analysis.tool_calls]
            failures.append(f"Missing delegations to: {missing} (tool calls: {tool_names})")
    
    # Tool invocation checks
    if expected.get("has_tool_calls") and not analysis.tool_calls:
        failures.append("Expected tool calls but none found")
    
    # Proof layer check
    if expected.get("has_proof_layer"):
        proof_indicators = ["reasoning", "confidence", "because", "based on", "analysis shows"]
        has_proof = any(ind in text_lower for ind in proof_indicators)
        if not has_proof:
            warnings.append("No obvious proof layer indicators in response")
    
    # Clarification request check
    if expected.get("is_clarification_request"):
        clarification_indicators = ["which", "specify", "clarify", "could you", "what specifically", "more information"]
        is_clarification = any(ind in text_lower for ind in clarification_indicators)
        if not is_clarification:
            failures.append("Expected clarification request but response appears definitive")
    
    # Graceful failure check
    if expected.get("graceful_failure"):
        failure_indicators = ["no data", "not found", "don't have", "unable to", "not available", "cannot find"]
        is_graceful = any(ind in text_lower for ind in failure_indicators)
        if not is_graceful:
            failures.append("Expected graceful failure message but got different response")
    
    # Timeout check
    if "max_response_time_seconds" in expected:
        max_time = expected["max_response_time_seconds"]
        actual_time = analysis.total_time_ms / 1000
        if actual_time > max_time:
            failures.append(f"Response took {actual_time:.1f}s, max allowed: {max_time}s")
    
    return ValidationResult(
        passed=len(failures) == 0,
        failures=failures,
        warnings=warnings
    )


async def run_single_test(
    client: httpx.AsyncClient,
    config: dict,
    test: dict
) -> TestResult:
    """Execute a single test against the API server."""
    
    test_id = test["id"]
    agent = test["agent"]
    query = test["query"]
    expected = test.get("expected", {})
    timeout = expected.get("max_response_time_seconds", config.get("default_timeout_seconds", 60))
    
    session_id = f"stress_test_{uuid.uuid4().hex[:8]}"
    user_id = config.get("user_id", "stress_test_user")
    base_url = config.get("api_base_url", "http://localhost:8000")
    
    start_time = datetime.now()
    
    try:
        # Create session
        session_url = f"{base_url}/apps/{agent}/users/{user_id}/sessions/{session_id}"
        await client.post(session_url, json={}, timeout=10)
        
        # Send query
        run_url = f"{base_url}/run"
        payload = {
            "appName": agent,
            "userId": user_id,
            "sessionId": session_id,
            "newMessage": {
                "role": "user",
                "parts": [{"text": query}]
            }
        }
        
        response = await client.post(run_url, json=payload, timeout=timeout)
        response.raise_for_status()
        events = response.json()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Analyze events
        analysis = analyze_events(events)
        analysis.total_time_ms = duration * 1000
        
        # Validate
        validation = validate_response(analysis, expected)
        
        return TestResult(
            test_id=test_id,
            agent=agent,
            query=query,
            passed=validation.passed,
            analysis=analysis,
            validation=validation,
            duration_seconds=duration
        )
        
    except httpx.TimeoutException:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        analysis = EventAnalysis(error=f"Timeout after {duration:.1f}s", total_time_ms=duration*1000)
        return TestResult(
            test_id=test_id,
            agent=agent,
            query=query,
            passed=False,
            analysis=analysis,
            validation=ValidationResult(passed=False, failures=[f"Timeout after {duration:.1f}s"]),
            duration_seconds=duration
        )
    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        analysis = EventAnalysis(error=str(e), total_time_ms=duration*1000)
        return TestResult(
            test_id=test_id,
            agent=agent,
            query=query,
            passed=False,
            analysis=analysis,
            validation=ValidationResult(passed=False, failures=[f"Exception: {str(e)}"]),
            duration_seconds=duration
        )


async def run_test_suite(
    client: httpx.AsyncClient,
    config: dict,
    suite: dict
) -> list[TestResult]:
    """Run all tests in a suite."""
    results = []
    suite_name = suite.get("name", "Unknown Suite")
    tests = suite.get("tests", [])
    
    console.print(f"\n[bold blue]Running: {suite_name}[/bold blue]")
    console.print(f"[dim]{suite.get('description', '')}[/dim]\n")
    
    for test in tests:
        test_id = test["id"]
        with console.status(f"[cyan]Running {test_id}...[/cyan]"):
            result = await run_single_test(client, config, test)
            results.append(result)
        
        if result.passed:
            console.print(f"  [green]✓[/green] {test_id}: PASSED ({result.duration_seconds:.1f}s)")
        else:
            console.print(f"  [red]✗[/red] {test_id}: FAILED ({result.duration_seconds:.1f}s)")
            for failure in result.validation.failures:
                console.print(f"    [red]└─ {failure}[/red]")
        
        for warning in result.validation.warnings:
            console.print(f"    [yellow]⚠ {warning}[/yellow]")
    
    return results


async def verify_server(base_url: str) -> bool:
    """Check if ADK API server is running."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/list-apps", timeout=5)
            return response.status_code == 200
    except:
        return False


async def main(matrix_path: str, output_dir: str):
    """Main test execution."""
    
    matrix_file = Path(matrix_path)
    if not matrix_file.exists():
        console.print(f"[red]Error: Matrix file not found: {matrix_path}[/red]")
        return
    
    with open(matrix_file) as f:
        matrix = yaml.safe_load(f)
    
    config = matrix.get("config", {})
    base_url = config.get("api_base_url", "http://localhost:8000")
    
    console.print(f"\n[bold]RANGER Agent Stress Test[/bold]")
    console.print(f"API Server: {base_url}")
    
    if not await verify_server(base_url):
        console.print(f"\n[red]Error: Cannot connect to API server at {base_url}[/red]")
        console.print("[yellow]Start the server with: cd agents && adk api_server[/yellow]")
        return
    
    console.print("[green]✓ Server connected[/green]\n")
    
    all_results: list[TestResult] = []
    suite_summaries = []
    
    async with httpx.AsyncClient() as client:
        for suite in matrix.get("test_suites", []):
            results = await run_test_suite(client, config, suite)
            all_results.extend(results)
            
            passed = sum(1 for r in results if r.passed)
            total = len(results)
            suite_summaries.append({
                "name": suite.get("name", "Unknown"),
                "passed": passed,
                "total": total
            })
    
    console.print("\n")
    console.print(Panel.fit("[bold]Test Summary[/bold]"))
    
    table = Table(show_header=True)
    table.add_column("Suite", style="cyan")
    table.add_column("Passed", justify="right")
    table.add_column("Total", justify="right")
    table.add_column("Status", justify="center")
    
    for summary in suite_summaries:
        status = "[green]✓[/green]" if summary["passed"] == summary["total"] else "[red]✗[/red]"
        table.add_row(
            summary["name"],
            str(summary["passed"]),
            str(summary["total"]),
            status
        )
    
    total_passed = sum(1 for r in all_results if r.passed)
    total_tests = len(all_results)
    table.add_row(
        "[bold]TOTAL[/bold]",
        f"[bold]{total_passed}[/bold]",
        f"[bold]{total_tests}[/bold]",
        "[bold green]✓[/bold green]" if total_passed == total_tests else "[bold red]✗[/bold red]"
    )
    
    console.print(table)
    
    # Save results
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = output_path / f"stress_test_{timestamp}.json"
    
    serializable_results = []
    for r in all_results:
        serializable_results.append({
            "test_id": r.test_id,
            "agent": r.agent,
            "query": r.query,
            "passed": r.passed,
            "duration_seconds": r.duration_seconds,
            "failures": r.validation.failures,
            "warnings": r.validation.warnings,
            "agents_involved": r.analysis.agents_involved,
            "tool_calls_count": len(r.analysis.tool_calls),
            "final_text_preview": r.analysis.final_text[:500] if r.analysis.final_text else "",
            "error": r.analysis.error
        })
    
    with open(results_file, "w") as f:
        json.dump({
            "timestamp": timestamp,
            "summary": {
                "total_passed": total_passed,
                "total_tests": total_tests,
                "pass_rate": total_passed / total_tests if total_tests > 0 else 0
            },
            "suite_summaries": suite_summaries,
            "results": serializable_results
        }, f, indent=2)
    
    console.print(f"\n[dim]Results saved to: {results_file}[/dim]")
    
    failures = [r for r in all_results if not r.passed]
    if failures:
        console.print(f"\n[bold red]Failed Tests ({len(failures)}):[/bold red]")
        for r in failures:
            console.print(f"\n[red]{r.test_id}[/red] ({r.agent})")
            console.print(f"  Query: {r.query[:80]}...")
            for f in r.validation.failures:
                console.print(f"  [red]• {f}[/red]")
            if r.analysis.error:
                console.print(f"  [red]Error: {r.analysis.error}[/red]")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RANGER Agent Stress Test")
    parser.add_argument("--matrix", required=True, help="Path to test matrix YAML")
    parser.add_argument("--output", default="./results", help="Output directory for results")
    
    args = parser.parse_args()
    asyncio.run(main(args.matrix, args.output))

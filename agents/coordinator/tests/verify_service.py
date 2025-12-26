import asyncio
import sys
from pathlib import Path

# Fix paths for import
root = Path(__file__).parents[3]
sys.path.insert(0, str(root))

# Add agents path for 'route_query' import inside CoordinatorService
sys.path.insert(0, str(root / "agents"))
sys.path.insert(0, str(root / "agents" / "coordinator" / "skills" / "delegation" / "scripts"))

from agents.coordinator.implementation import CoordinatorService

async def test_coordinator():
    print("Initializing CoordinatorService...")
    service = CoordinatorService()
    
    # Test 1: Generic Query
    print("\n--- Test 1: Generic Query ---")
    response1 = await service.handle_message(
        "Hello RANGER", 
        {"session_id": "test-1"}
    )
    print(f"Role: {response1.get('agent_role')}")
    print(f"Summary: {response1.get('summary')}")

    # Test 2: Portfolio Query (Fan-Out)
    print("\n--- Test 2: Portfolio Query ---")
    response2 = await service.handle_message(
        "Prioritize active fires in R6", 
        {"session_id": "test-2"}
    )
    print(f"Role: {response2.get('agent_role')}")
    print(f"Summary: {response2.get('summary')}")
    print(f"Reasoning: {response2.get('reasoning')}")

if __name__ == "__main__":
    asyncio.run(test_coordinator())

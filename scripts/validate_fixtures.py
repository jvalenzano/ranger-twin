#!/usr/bin/env python3
import json
from pathlib import Path
import sys

def validate_fixture(path, validator):
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        validator(data)
        print(f"✓ {path.name} valid")
        return True
    except Exception as e:
        print(f"✗ {path.name} invalid: {e}")
        return False

def validate_incident(data):
    # Support both fire_id and incident_id
    required = ['name', 'acres', 'containment', 'discovery_date']
    for field in required:
        assert field in data, f"Missing field: {field}"
    assert ('incident_id' in data or 'fire_id' in data), "Missing incident_id or fire_id"

def validate_burn_severity(data):
    required = ['fire_id', 'sectors', 'summary']
    for field in required:
        assert field in data, f"Missing field: {field}"
    assert isinstance(data['sectors'], list), "Sectors must be a list"

def validate_trails(data):
    assert 'trails' in data, "Missing trials field"
    assert isinstance(data['trails'], list), "Trails must be a list"

def validate_timber(data):
    assert 'plots' in data, "Missing plots field"
    assert isinstance(data['plots'], list), "Plots must be a list"

def validate_nepa(data):
    assert 'pathways' in data, "Missing pathways field"
    assert isinstance(data['pathways'], list), "Pathways must be a list"

def main():
    base_path = Path("data/fixtures")
    valid = True
    
    fixtures = [
        (base_path / "incidents/cedar-creek.json", validate_incident),
        (base_path / "burn-severity/cedar-creek-sectors.json", validate_burn_severity),
        (base_path / "trails/cedar-creek-trails.json", validate_trails),
        (base_path / "timber/cedar-creek-salvage.json", validate_timber),
        (base_path / "nepa/pathways.json", validate_nepa),
    ]
    
    for path, validator in fixtures:
        if path.exists():
            if not validate_fixture(path, validator):
                valid = False
        else:
            print(f"! {path} missing")
            valid = False
            
    if not valid:
        sys.exit(1)

if __name__ == "__main__":
    main()

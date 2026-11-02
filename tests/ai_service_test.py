"""
CarbonIQ AI Microservice Automated Test Suite
Tests FastAPI endpoints, Pydantic validation, and rule-based fallback recommendations.
"""

import sys
import os
from fastapi.testclient import TestClient

# Ensure ai-service app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../ai-service")))

from app.main import app

client = TestClient(app)

def run_tests():
    print("==============================================================================")
    print("STARTING CARBONIQ AI MICROSERVICE TEST SUITE")
    print("==============================================================================")
    
    total = 0
    passed = 0

    def test(name, fn):
        nonlocal total, passed
        total += 1
        sys.stdout.write(f"[TEST {total}] {name} ... ")
        try:
            fn()
            print("PASSED [OK]")
            passed += 1
        except Exception as e:
            print("FAILED [X]")
            print(f"       Failure Details: {e}")

    # 1. Health check
    def test_health():
        res = client.get("/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data["status"] == "healthy"
        assert data["fallback_available"] is True

    test("Health Check Endpoint (GET /health)", test_health)

    # 2. Insights Generation with Valid Metrics
    def test_insights_generation():
        payload = {
            "period": "2026-10",
            "workspace_type": "personal",
            "total_emissions_kg_co2e": 450.5,
            "previous_period_emissions_kg_co2e": 400.0,
            "category_totals": [
                {"category": "electricity", "kg_co2e": 250.0},
                {"category": "transportation", "kg_co2e": 120.0},
                {"category": "fuel", "kg_co2e": 50.0},
                {"category": "lpg", "kg_co2e": 20.0},
                {"category": "waste", "kg_co2e": 10.5}
            ]
        }
        res = client.post("/api/v1/insights/generate", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert "summary" in data
        assert len(data["recommendations"]) > 0
        assert data["source_engine"] in ["rule_based_fallback", "ai_gemini"]
        
        # Check first recommendation structure
        first_rec = data["recommendations"][0]
        assert first_rec["category"] == "electricity"
        assert first_rec["priority"] in ["high", "medium", "low"]
        assert first_rec["potential_reduction_co2e_kg"] > 0
        assert len(first_rec["action"]) > 10

    test("Insight Generation with Valid Categories (POST /api/v1/insights/generate)", test_insights_generation)

    # 3. Pydantic Validation: Reject Negative Emissions
    def test_negative_emissions_rejection():
        payload = {
            "period": "2026-10",
            "workspace_type": "personal",
            "total_emissions_kg_co2e": -50.0, # Violates ge=0
            "category_totals": []
        }
        res = client.post("/api/v1/insights/generate", json=payload)
        assert res.status_code == 422, f"Expected 422 Unprocessable Entity, got {res.status_code}"

    test("Schema Validation: Negative Total Emissions Rejection (422)", test_negative_emissions_rejection)

    # 4. Multi-Category Priority Ranking
    def test_transport_leading_priority():
        payload = {
            "period": "2026-10",
            "workspace_type": "organization",
            "total_emissions_kg_co2e": 300.0,
            "previous_period_emissions_kg_co2e": 350.0,
            "category_totals": [
                {"category": "transportation", "kg_co2e": 250.0},
                {"category": "waste", "kg_co2e": 50.0}
            ]
        }
        res = client.post("/api/v1/insights/generate", json=payload)
        assert res.status_code == 200
        data = res.json()
        # Top recommendation should target transportation
        top_rec = data["recommendations"][0]
        assert top_rec["category"] == "transportation"
        assert "decrease" in data["summary"].lower()

    test("Priority Ranking: Top Emission Category Targeting", test_transport_leading_priority)

    print("\n==============================================================================")
    print(f"AI SERVICE TEST SUMMARY: {passed} / {total} TESTS PASSED")
    print("==============================================================================\n")

    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()

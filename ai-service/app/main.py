"""
CarbonIQ AI & Recommendation Microservice
FastAPI service generating structured reduction recommendations using
Google Gemini API (when configured) with an automatic offline rule-based fallback engine.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv

# Load root .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("carboniq-ai")

app = FastAPI(
    title="CarbonIQ AI Insights Microservice",
    version="1.0.0",
    description="Privacy-preserving carbon footprint analytics and recommendation engine for CarbonIQ"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CategoryTotal(BaseModel):
    category: str
    kg_co2e: float

class InsightRequest(BaseModel):
    period: str = Field(default="Current Window")
    workspace_type: str = Field(..., description="'personal' or 'organization'")
    total_emissions_kg_co2e: float = Field(..., ge=0)
    previous_period_emissions_kg_co2e: float = Field(default=0.0, ge=0)
    category_totals: List[CategoryTotal] = Field(default_factory=list)

class RecommendationItem(BaseModel):
    title: str
    category: str
    priority: str = Field(..., description="'high', 'medium', or 'low'")
    reason: str
    action: str
    potential_reduction_co2e_kg: float
    supporting_metric: str

class InsightResponse(BaseModel):
    summary: str
    recommendations: List[RecommendationItem]
    source_engine: str
    disclaimer: str

def generate_rule_based_recommendations(req: InsightRequest) -> InsightResponse:
    """
    Deterministic rule-based recommendation fallback engine.
    Analyzes actual verified category totals and constructs actionable reduction steps
    without requiring external network or paid API credentials.
    """
    recs: List[RecommendationItem] = []
    
    # Sort categories by emission volume descending
    sorted_cats = sorted(req.category_totals, key=lambda x: x.kg_co2e, reverse=True)
    
    # Percentage change calculation
    pct_change = 0.0
    if req.previous_period_emissions_kg_co2e > 0:
        pct_change = round(
            ((req.total_emissions_kg_co2e - req.previous_period_emissions_kg_co2e) / req.previous_period_emissions_kg_co2e) * 100,
            2
        )

    for cat in sorted_cats:
        c_code = cat.category.lower()
        co2 = cat.kg_co2e
        if co2 <= 0:
            continue

        if c_code == "electricity":
            potential = round(co2 * 0.15, 2)
            recs.append(RecommendationItem(
                title="Optimize HVAC Setpoints and Eliminate Phantom Standby Loads",
                category="electricity",
                priority="high" if co2 > 100 else "medium",
                reason=f"Electricity consumption contributed {co2:.1f} kg CO2e ({round(co2 / max(1, req.total_emissions_kg_co2e) * 100)}% of footprint).",
                action="Increase cooling thermostats to 24°C, deploy programmable smart power strips on workstation clusters, and transition any remaining fluorescent fixtures to LEDs.",
                potential_reduction_co2e_kg=potential,
                supporting_metric=f"{co2:.1f} kg CO2e from grid electricity"
            ))
        elif c_code == "transportation":
            potential = round(co2 * 0.20, 2)
            recs.append(RecommendationItem(
                title="Transition Commutes to Public Transit or Shared Mobility",
                category="transportation",
                priority="high" if co2 > 50 else "medium",
                reason=f"Transportation travel generated {co2:.1f} kg CO2e across recorded commutes and trips.",
                action="Substitute two private vehicle driving days per week with metro or public bus transit, or implement corporate carpool coordination for recurring routes.",
                potential_reduction_co2e_kg=potential,
                supporting_metric=f"{co2:.1f} kg CO2e from passenger travel"
            ))
        elif c_code == "fuel":
            potential = round(co2 * 0.12, 2)
            recs.append(RecommendationItem(
                title="Audit Standby Generator Maintenance & Testing Cycles",
                category="fuel",
                priority="medium",
                reason=f"Direct fuel combustion contributed {co2:.1f} kg CO2e from diesel or petrol machinery.",
                action="Review generator maintenance logs to ensure optimal fuel injection timing and avoid excessive unloaded idle runtime during routine testing.",
                potential_reduction_co2e_kg=potential,
                supporting_metric=f"{co2:.1f} kg CO2e from liquid combustion"
            ))
        elif c_code == "lpg":
            potential = round(co2 * 0.10, 2)
            recs.append(RecommendationItem(
                title="Improve Cookware Heat Retention and Burner Aeration",
                category="lpg",
                priority="medium",
                reason=f"Cooking fuel generated {co2:.1f} kg CO2e from LPG cylinder consumption.",
                action="Ensure gas burners produce clean blue flame aeration, cover cooking vessels to reduce heat loss by up to 20%, and consider induction hobs for boiling tasks.",
                potential_reduction_co2e_kg=potential,
                supporting_metric=f"{co2:.1f} kg CO2e from LPG usage"
            ))
        elif c_code == "waste":
            potential = round(co2 * 0.25, 2)
            recs.append(RecommendationItem(
                title="Divert Organic Waste from Landfill via Aerobic Composting",
                category="waste",
                priority="low",
                reason=f"Solid waste disposal to landfill accounted for {co2:.1f} kg CO2e.",
                action="Implement source segregation separating food scraps and garden organics for local composting, preventing methane emissions generated in anaerobic landfills.",
                potential_reduction_co2e_kg=potential,
                supporting_metric=f"{co2:.1f} kg CO2e from solid waste"
            ))

    if pct_change < 0:
        summary_text = f"Overall emissions decreased by {abs(pct_change):.1f}% compared with the prior period. Continue current conservation practices."
    elif pct_change > 0:
        top_name = sorted_cats[0].category.capitalize() if sorted_cats else "primary"
        summary_text = f"Emissions increased by {pct_change:.1f}% versus the prior period, driven primarily by {top_name}. Targeting top opportunities below can reverse this trend."
    else:
        summary_text = f"Baseline established at {req.total_emissions_kg_co2e:.1f} kg CO2e. Actionable steps below highlight immediate conservation potential."

    return InsightResponse(
        summary=summary_text,
        recommendations=recs[:4],
        source_engine="rule_based_fallback",
        disclaimer="Recommendations are informational and derived deterministically from verified activity metrics."
    )

@app.get("/health")
def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    has_valid_key = bool(gemini_key and not gemini_key.startswith("your_"))
    return {
        "status": "healthy",
        "service": "CarbonIQ AI & Recommendation Microservice",
        "active_provider": "gemini" if has_valid_key else "rule_based_fallback",
        "fallback_available": True
    }

@app.post("/api/v1/insights/generate", response_model=InsightResponse)
def generate_insights(req: InsightRequest):
    """
    Primary endpoint for structured emission insights.
    Attempts external AI generation if credentials are configured;
    gracefully falls back to the deterministic rule-based engine.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    has_valid_key = bool(gemini_key and not gemini_key.startswith("your_"))

    if has_valid_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            prompt = f"""
You are an expert environmental carbon footprint auditor for CarbonIQ.
Analyze these aggregated emission metrics:
- Workspace Type: {req.workspace_type}
- Total Emissions: {req.total_emissions_kg_co2e:.1f} kg CO2e
- Prior Period Emissions: {req.previous_period_emissions_kg_co2e:.1f} kg CO2e
- Category Breakdown: {[{'category': c.category, 'kg_co2e': c.kg_co2e} for c in req.category_totals]}

Generate a concise summary and up to 3 prioritized, highly practical reduction recommendations.
Do NOT invent factor values or change calculated totals.
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=InsightResponse,
                ),
            )
            parsed = response.parsed
            if parsed and isinstance(parsed, InsightResponse):
                parsed.source_engine = "ai_gemini"
                return parsed
        except Exception as e:
            logger.warning(f"External Gemini API call failed or timed out: {e}. Activating rule-based fallback.")

    # Graceful deterministic fallback
    return generate_rule_based_recommendations(req)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

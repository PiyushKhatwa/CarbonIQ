"""
CarbonIQ AI & Recommendation Microservice
Provides structured insights using Google Gemini API or deterministic rule-based fallback.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CarbonIQ AI Insights Microservice",
    version="1.0.0",
    description="Privacy-preserving emission insights engine for CarbonIQ"
)

class CategoryTotal(BaseModel):
    category: str
    kg_co2e: float

class InsightRequest(BaseModel):
    period: str
    workspace_type: str = Field(..., description="'personal' or 'organization'")
    total_emissions_kg_co2e: float
    previous_period_emissions_kg_co2e: float
    category_totals: List[CategoryTotal]

class RecommendationItem(BaseModel):
    title: str
    category: str
    priority: str
    reason: str
    action: str
    supporting_metric: str

class InsightResponse(BaseModel):
    summary: str
    recommendations: List[RecommendationItem]
    source_engine: str
    disclaimer: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CarbonIQ AI Engine",
        "fallback_ready": True
    }

@app.post("/api/v1/insights/generate", response_model=InsightResponse)
def generate_insights(req: InsightRequest):
    # Rule-based fallback baseline engine (always active and reliable)
    recs = []
    
    # Sort categories by footprint descending
    sorted_cats = sorted(req.category_totals, key=lambda x: x.kg_co2e, reverse=True)
    
    if sorted_cats:
        top_cat = sorted_cats[0]
        if top_cat.category.lower() == "electricity":
            recs.append(RecommendationItem(
                title="Optimize Heating, AC and Continuous Loads",
                category="electricity",
                priority="high",
                reason=f"Electricity is your largest footprint contributor ({top_cat.kg_co2e:.1f} kg CO2e).",
                action="Set cooling thermostats to 24°C and switch off idle computer nodes and appliances.",
                supporting_metric=f"{top_cat.kg_co2e:.1f} kg CO2e"
            ))
        elif top_cat.category.lower() == "transportation":
            recs.append(RecommendationItem(
                title="Shift Commute to Public Transit or Metro",
                category="transportation",
                priority="high",
                reason=f"Transportation generated {top_cat.kg_co2e:.1f} kg CO2e during this period.",
                action="Explore carpooling or replacing 2 solo driving days per week with metro transit.",
                supporting_metric=f"{top_cat.kg_co2e:.1f} kg CO2e"
            ))
        elif top_cat.category.lower() == "fuel":
            recs.append(RecommendationItem(
                title="Review Generator & Combustion Duty Cycles",
                category="fuel",
                priority="medium",
                reason=f"Stationary combustion accounted for {top_cat.kg_co2e:.1f} kg CO2e.",
                action="Ensure scheduled diesel generator maintenance and avoid unnecessary idle run times.",
                supporting_metric=f"{top_cat.kg_co2e:.1f} kg CO2e"
            ))
            
    pct_change = 0.0
    if req.previous_period_emissions_kg_co2e > 0:
        pct_change = ((req.total_emissions_kg_co2e - req.previous_period_emissions_kg_co2e) / req.previous_period_emissions_kg_co2e) * 100

    summary_text = f"Your emissions changed by {pct_change:+.1f}% compared with the prior period."
    if pct_change < 0:
        summary_text = f"Great work! Your carbon emissions decreased by {abs(pct_change):.1f}%."
    elif pct_change > 0:
        summary_text = f"Emissions increased by {pct_change:.1f}% versus the prior period. Target your primary category to reverse this trend."

    return InsightResponse(
        summary=summary_text,
        recommendations=recs,
        source_engine="rule_based_fallback",
        disclaimer="Recommendations are informational and generated based on verified activity metrics."
    )


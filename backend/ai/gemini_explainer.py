"""
Gemini-based Explanation Module for ORBITNET-MESH
Converts system decisions into human-readable explanations
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
import json

# Optional Gemini API integration
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None


@dataclass
class SystemDecision:
    """Represents a system decision that needs explanation"""
    selected_link: str  # "ground", "satellite", "none"
    satellite_visible: bool
    ground_visible: bool
    system_mode: str  # "ORBITNET" or "GROUND_ONLY"
    telemetry_action: str  # "transmitted", "stored", "lost"
    link_name: Optional[str] = None
    signal_strength: Optional[float] = None
    elevation_angle: Optional[float] = None
    weather_impact: Optional[str] = None


class GeminiExplainer:
    """
    AI-powered explanation generator for ORBITNET-MESH system decisions
    """
    
    def __init__(self, use_real_api: bool = False):
        """
        Initialize the explainer
        Args:
            use_real_api: If True, attempt to use real Gemini API
        """
        self.use_real_api = use_real_api
        self.model = None
        
        if use_real_api and GEMINI_AVAILABLE:
            # Import config here to avoid circular imports
            try:
                from config import settings
                api_key = settings.GEMINI_API_KEY
            except ImportError:
                # Fallback to environment variable
                api_key = os.getenv('GEMINI_API_KEY')
            
            if api_key:
                try:
                    genai.configure(api_key=api_key)
                    self.model = genai.GenerativeModel('gemini-2.5-flash-lite')  # Try lite version for lower quota usage
                    print("✅ Gemini API initialized successfully")
                except Exception as e:
                    print(f"⚠️ Gemini API initialization failed: {e}")
                    self.model = None
            else:
                print("⚠️ GEMINI_API_KEY not found in configuration or environment variables")
        
        if not self.model:
            print("📝 Using mock Gemini explanations (set GEMINI_API_KEY for real API)")
    
    async def explain_decision(self, decision: SystemDecision) -> str:
        """
        Generate human-readable explanation for a system decision
        
        Args:
            decision: SystemDecision object containing all relevant information
            
        Returns:
            str: Human-readable explanation of the decision
        """
        if self.model and self.use_real_api:
            return await self._generate_real_explanation(decision)
        else:
            return self._generate_mock_explanation(decision)
    
    async def _generate_real_explanation(self, decision: SystemDecision) -> str:
        """Generate explanation using real Gemini API"""
        try:
            prompt = self._build_prompt(decision)
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ Gemini API call failed: {e}")
            # Fallback to mock explanation
            return self._generate_mock_explanation(decision)
    
    def _generate_mock_explanation(self, decision: SystemDecision) -> str:
        """
        Generate explanation using rule-based logic (mock Gemini)
        This provides realistic explanations without requiring API access
        """
        
        # Base explanation templates
        explanations = []
        
        # Link selection explanation
        if decision.selected_link == "ground":
            if decision.ground_visible:
                explanations.append(f"Direct ground link established with {decision.link_name or 'ground station'}")
                if decision.signal_strength:
                    explanations.append(f"(signal strength: {decision.signal_strength:.1f}%)")
            else:
                explanations.append("Ground link attempted but station not visible")
        
        elif decision.selected_link == "satellite":
            if decision.satellite_visible:
                explanations.append(f"Satellite relay selected via {decision.link_name or 'relay satellite'}")
                if decision.elevation_angle:
                    explanations.append(f"(elevation: {decision.elevation_angle:.1f}°)")
            else:
                explanations.append("Satellite relay attempted but no satellites visible")
        
        elif decision.selected_link == "none":
            if not decision.ground_visible and not decision.satellite_visible:
                explanations.append("Communication blackout - no ground or satellite links available")
            elif not decision.ground_visible:
                explanations.append("Ground station not visible, no satellite relays available")
            elif not decision.satellite_visible:
                explanations.append("Satellite relays not visible, ground link unavailable")
        
        # Weather impact
        if decision.weather_impact:
            explanations.append(f"Weather conditions: {decision.weather_impact}")
        
        # System mode and action explanation
        if decision.system_mode == "ORBITNET":
            if decision.telemetry_action == "transmitted":
                explanations.append("Telemetry transmitted successfully via ORBITNET-MESH")
            elif decision.telemetry_action == "stored":
                explanations.append("Telemetry buffered in onboard storage - zero data loss guaranteed")
            elif decision.telemetry_action == "forwarded":
                explanations.append("Stored telemetry forwarded when link became available")
        
        elif decision.system_mode == "GROUND_ONLY":
            if decision.telemetry_action == "transmitted":
                explanations.append("Telemetry transmitted directly to ground (ground-only mode)")
            elif decision.telemetry_action == "lost":
                explanations.append("Telemetry lost - ground-only mode cannot buffer data")
        
        # Combine explanations
        if explanations:
            return ". ".join(explanations) + "."
        else:
            return "System operating normally."
    
    def _build_prompt(self, decision: SystemDecision) -> str:
        """Build prompt for Gemini API"""
        return f"""
You are an AI assistant for the ORBITNET-MESH satellite communication system. 
Explain the following system decision in 1-2 clear, technical sentences:

System Status:
- Selected Link: {decision.selected_link}
- Ground Station Visible: {decision.ground_visible}
- Satellite Relay Visible: {decision.satellite_visible}
- System Mode: {decision.system_mode}
- Telemetry Action: {decision.telemetry_action}
- Link Name: {decision.link_name or 'N/A'}
- Signal Strength: {decision.signal_strength or 'N/A'}%
- Elevation Angle: {decision.elevation_angle or 'N/A'}°
- Weather Impact: {decision.weather_impact or 'Clear'}

Context:
- ORBITNET mode: Zero data loss through store-and-forward
- GROUND_ONLY mode: Data lost during communication blackouts
- System automatically selects best available communication link

Provide a concise, technical explanation of why this decision was made:
"""
    
    def get_status(self) -> Dict[str, Any]:
        """Get explainer status"""
        return {
            "gemini_available": GEMINI_AVAILABLE,
            "using_real_api": self.model is not None,
            "model_ready": self.model is not None or not self.use_real_api
        }


# Global explainer instance
explainer = GeminiExplainer(use_real_api=True)  # Using real Gemini API


# Convenience functions for easy integration
async def explain_link_selection(
    selected_link: str,
    satellite_visible: bool,
    ground_visible: bool,
    system_mode: str,
    telemetry_action: str,
    **kwargs
) -> str:
    """
    Quick explanation for link selection decisions
    
    Args:
        selected_link: "ground", "satellite", or "none"
        satellite_visible: Whether satellite relay is visible
        ground_visible: Whether ground station is visible
        system_mode: "ORBITNET" or "GROUND_ONLY"
        telemetry_action: "transmitted", "stored", "lost", "forwarded"
        **kwargs: Additional parameters (link_name, signal_strength, etc.)
    
    Returns:
        str: Human-readable explanation
    """
    decision = SystemDecision(
        selected_link=selected_link,
        satellite_visible=satellite_visible,
        ground_visible=ground_visible,
        system_mode=system_mode,
        telemetry_action=telemetry_action,
        **kwargs
    )
    
    return await explainer.explain_decision(decision)


async def explain_communication_status(
    link_available: bool,
    link_type: str,
    system_mode: str,
    data_buffered: int = 0
) -> str:
    """
    Quick explanation for current communication status
    
    Args:
        link_available: Whether any communication link is available
        link_type: Type of current link ("ground", "satellite", "none")
        system_mode: Current system mode
        data_buffered: Number of packets currently buffered
    
    Returns:
        str: Status explanation
    """
    if link_available:
        action = "transmitted"
    elif system_mode == "ORBITNET":
        action = "stored"
    else:
        action = "lost"
    
    decision = SystemDecision(
        selected_link=link_type,
        satellite_visible=link_type == "satellite",
        ground_visible=link_type == "ground",
        system_mode=system_mode,
        telemetry_action=action
    )
    
    explanation = await explainer.explain_decision(decision)
    
    if data_buffered > 0:
        explanation += f" ({data_buffered} packets currently buffered)"
    
    return explanation


# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_explainer():
        """Test the explanation system"""
        print("🧪 Testing Gemini Explainer")
        print("=" * 50)
        
        # Test scenarios
        scenarios = [
            {
                "name": "Ground Link Active",
                "decision": SystemDecision(
                    selected_link="ground",
                    satellite_visible=False,
                    ground_visible=True,
                    system_mode="ORBITNET",
                    telemetry_action="transmitted",
                    link_name="ESTRACK Kourou",
                    signal_strength=85.2
                )
            },
            {
                "name": "Satellite Relay",
                "decision": SystemDecision(
                    selected_link="satellite",
                    satellite_visible=True,
                    ground_visible=False,
                    system_mode="ORBITNET",
                    telemetry_action="transmitted",
                    link_name="EDRS-A",
                    elevation_angle=45.3
                )
            },
            {
                "name": "Communication Blackout (ORBITNET)",
                "decision": SystemDecision(
                    selected_link="none",
                    satellite_visible=False,
                    ground_visible=False,
                    system_mode="ORBITNET",
                    telemetry_action="stored"
                )
            },
            {
                "name": "Communication Blackout (Ground-Only)",
                "decision": SystemDecision(
                    selected_link="none",
                    satellite_visible=False,
                    ground_visible=False,
                    system_mode="GROUND_ONLY",
                    telemetry_action="lost"
                )
            }
        ]
        
        for scenario in scenarios:
            print(f"\n📡 {scenario['name']}:")
            explanation = await explainer.explain_decision(scenario['decision'])
            print(f"   {explanation}")
        
        print(f"\n📊 Explainer Status: {explainer.get_status()}")
    
    # Run test
    asyncio.run(test_explainer())
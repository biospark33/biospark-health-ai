
"""
Memory-Enhanced LabInsight AI API
Phase 2C: Memory + Context Integration with Ray Peat Knowledge
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LabAnalysisRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    query: str
    lab_data: Dict[str, Any]
    include_context: bool = True

class MemoryEnhancedResponse(BaseModel):
    analysis: str
    sources: List[Dict[str, Any]]
    context_used: Dict[str, Any]
    personalized: bool
    session_id: str
    recommendations: List[str]
    health_trends: Optional[Dict[str, Any]] = None

class MemoryEnhancedAPI:
    def __init__(self):
        self.app = FastAPI(title="LabInsight AI - Memory Enhanced", version="2.0.0")
        self.memory_url = "http://localhost:8002"
        self.rag_url = "http://localhost:8001"
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup FastAPI routes"""
        
        @self.app.post("/analyze-with-memory", response_model=MemoryEnhancedResponse)
        async def analyze_with_memory(request: LabAnalysisRequest, background_tasks: BackgroundTasks):
            return await self.create_contextual_analysis(request, background_tasks)
        
        @self.app.get("/health-journey/{user_id}")
        async def get_health_journey(user_id: str, days: int = 30):
            return await self.get_user_health_journey(user_id, days)
        
        @self.app.post("/sessions")
        async def create_session(user_id: str):
            return await self.create_user_session(user_id)
        
        @self.app.get("/sessions/{session_id}/context")
        async def get_session_context(session_id: str, limit: int = 10):
            return await self.get_session_memory_context(session_id, limit)
        
        @self.app.get("/health")
        async def health_check():
            return {
                "status": "healthy",
                "service": "labinsight-ai-memory-enhanced",
                "timestamp": datetime.now().isoformat(),
                "memory_service": await self._check_memory_service(),
                "rag_service": await self._check_rag_service()
            }
    
    async def create_contextual_analysis(self, request: LabAnalysisRequest, background_tasks: BackgroundTasks) -> MemoryEnhancedResponse:
        """Create contextual analysis combining memory, current data, and Ray Peat knowledge"""
        try:
            # Generate session ID if not provided
            session_id = request.session_id or str(uuid.uuid4())
            
            # Ensure user session exists
            await self._ensure_user_session(request.user_id, session_id)
            
            # Get user's health journey context if requested
            health_context = {}
            if request.include_context:
                health_context = await self._get_health_journey_context(request.user_id)
            
            # Get relevant memory context
            memory_context = []
            if request.include_context:
                memory_context = await self._get_memory_context(session_id, request.query)
            
            # Build contextual prompt for Ray Peat analysis
            contextual_prompt = self._build_contextual_prompt(
                request.query, 
                request.lab_data, 
                health_context, 
                memory_context
            )
            
            # Get Ray Peat analysis with context
            rag_response = await self._get_rag_analysis(contextual_prompt)
            
            # Extract recommendations
            recommendations = self._extract_recommendations(rag_response.get('analysis', ''))
            
            # Store interaction in memory (background task)
            background_tasks.add_task(
                self._store_interaction_memory, 
                session_id, 
                request.query, 
                request.lab_data, 
                rag_response
            )
            
            # Update health journey (background task)
            background_tasks.add_task(
                self._update_health_journey, 
                request.user_id, 
                session_id, 
                request.lab_data, 
                rag_response
            )
            
            return MemoryEnhancedResponse(
                analysis=rag_response.get('analysis', ''),
                sources=rag_response.get('sources', []),
                context_used={
                    "health_journey_entries": len(health_context.get('trends', {})),
                    "memory_entries": len(memory_context),
                    "contextual_insights": request.include_context
                },
                personalized=request.include_context,
                session_id=session_id,
                recommendations=recommendations,
                health_trends=health_context.get('trends') if request.include_context else None
            )
            
        except Exception as e:
            logger.error(f"Contextual analysis error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_user_health_journey(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get user's health journey"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.memory_url}/health-journey/{user_id}/trends?days={days}")
                if response.status_code == 200:
                    return response.json()
                else:
                    raise HTTPException(status_code=response.status_code, detail="Failed to retrieve health journey")
        except Exception as e:
            logger.error(f"Health journey retrieval error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def create_user_session(self, user_id: str) -> Dict[str, Any]:
        """Create a new user session"""
        try:
            session_id = str(uuid.uuid4())
            async with httpx.AsyncClient() as client:
                session_data = {
                    "session_id": session_id,
                    "user_id": user_id,
                    "metadata": {
                        "created_by": "labinsight_ai",
                        "version": "2.0.0",
                        "features": ["memory", "context", "ray_peat_analysis"]
                    }
                }
                response = await client.post(f"{self.memory_url}/sessions", json=session_data)
                if response.status_code == 200:
                    return response.json()
                else:
                    raise HTTPException(status_code=response.status_code, detail="Failed to create session")
        except Exception as e:
            logger.error(f"Session creation error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_session_memory_context(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get session memory context"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.memory_url}/sessions/{session_id}/context?limit={limit}")
                if response.status_code == 200:
                    return response.json()
                else:
                    raise HTTPException(status_code=response.status_code, detail="Failed to retrieve context")
        except Exception as e:
            logger.error(f"Context retrieval error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _ensure_user_session(self, user_id: str, session_id: str):
        """Ensure user session exists"""
        try:
            async with httpx.AsyncClient() as client:
                session_data = {
                    "session_id": session_id,
                    "user_id": user_id,
                    "metadata": {"ensured_by": "memory_enhanced_api"}
                }
                await client.post(f"{self.memory_url}/sessions", json=session_data)
        except Exception as e:
            logger.error(f"Session ensure error: {e}")
    
    async def _get_health_journey_context(self, user_id: str, days: int = 90) -> Dict[str, Any]:
        """Get user's health journey context"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.memory_url}/health-journey/{user_id}/trends?days={days}")
                if response.status_code == 200:
                    return response.json()
                return {"trends": {}}
        except Exception as e:
            logger.error(f"Health journey context error: {e}")
            return {"trends": {}}
    
    async def _get_memory_context(self, session_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get relevant memory context for the query"""
        try:
            async with httpx.AsyncClient() as client:
                search_payload = {
                    "query": query,
                    "session_id": session_id,
                    "limit": limit,
                    "relevance_threshold": 0.6
                }
                response = await client.post(f"{self.memory_url}/sessions/{session_id}/search", json=search_payload)
                if response.status_code == 200:
                    return response.json()
                return []
        except Exception as e:
            logger.error(f"Memory context error: {e}")
            return []
    
    def _build_contextual_prompt(self, query: str, lab_data: Dict[str, Any], health_context: Dict[str, Any], memory_context: List[Dict[str, Any]]) -> str:
        """Build contextual prompt for Ray Peat analysis"""
        
        prompt_parts = [
            f"CONTEXTUAL HEALTH ANALYSIS REQUEST",
            f"Current Query: {query}",
            f"Current Lab Data: {json.dumps(lab_data, indent=2)}"
        ]
        
        # Add health journey context
        if health_context.get('trends'):
            prompt_parts.append("\nHEALTH JOURNEY CONTEXT:")
            for biomarker, trend_data in health_context['trends'].items():
                if trend_data:
                    latest = trend_data[-1]
                    if len(trend_data) > 1:
                        prev_value = trend_data[-2]['value']
                        current_value = latest['value']
                        if current_value > prev_value:
                            trend_direction = "improving"
                        elif current_value < prev_value:
                            trend_direction = "declining"
                        else:
                            trend_direction = "stable"
                    else:
                        trend_direction = "first measurement"
                    
                    prompt_parts.append(f"- {biomarker}: Latest value {latest['value']}, trend {trend_direction}")
                    if latest.get('interpretation'):
                        prompt_parts.append(f"  Previous Ray Peat interpretation: {latest['interpretation']}")
        
        # Add memory context
        if memory_context:
            prompt_parts.append("\nRELEVANT CONVERSATION HISTORY:")
            for memory in memory_context[-3:]:  # Last 3 relevant memories
                content_preview = memory['content'][:200] + "..." if len(memory['content']) > 200 else memory['content']
                prompt_parts.append(f"- {memory['role']}: {content_preview}")
        
        prompt_parts.append("\nPlease provide a Ray Peat-informed analysis that:")
        prompt_parts.append("1. Considers the user's health journey and trends")
        prompt_parts.append("2. References relevant previous conversations")
        prompt_parts.append("3. Provides personalized recommendations based on patterns")
        prompt_parts.append("4. Identifies any concerning trends or improvements")
        prompt_parts.append("5. Suggests specific Ray Peat protocols based on individual response history")
        
        return "\n".join(prompt_parts)
    
    async def _get_rag_analysis(self, contextual_prompt: str) -> Dict[str, Any]:
        """Get Ray Peat analysis with contextual prompt"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "query": contextual_prompt,
                    "include_sources": True,
                    "max_results": 5
                }
                response = await client.post(f"{self.rag_url}/query", json=payload)
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"RAG analysis failed: {response.status_code}")
                    return {"analysis": "Analysis temporarily unavailable", "sources": []}
        except Exception as e:
            logger.error(f"RAG analysis error: {e}")
            return {"analysis": "Analysis temporarily unavailable", "sources": []}
    
    async def _store_interaction_memory(self, session_id: str, query: str, lab_data: Dict[str, Any], rag_response: Dict[str, Any]):
        """Store the interaction in memory"""
        try:
            async with httpx.AsyncClient() as client:
                # Store user query
                user_message = {
                    "role": "user",
                    "content": f"Query: {query}\nLab Data: {json.dumps(lab_data)}",
                    "metadata": {
                        "type": "lab_analysis_request", 
                        "timestamp": datetime.now().isoformat(),
                        "lab_data_keys": list(lab_data.keys())
                    }
                }
                await client.post(f"{self.memory_url}/sessions/{session_id}/messages", json=user_message)
                
                # Store assistant response
                assistant_message = {
                    "role": "assistant",
                    "content": rag_response.get('analysis', ''),
                    "metadata": {
                        "type": "ray_peat_analysis",
                        "sources": rag_response.get('sources', []),
                        "contextual": True,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                await client.post(f"{self.memory_url}/sessions/{session_id}/messages", json=assistant_message)
                
        except Exception as e:
            logger.error(f"Memory storage error: {e}")
    
    async def _update_health_journey(self, user_id: str, session_id: str, lab_data: Dict[str, Any], rag_response: Dict[str, Any]):
        """Update health journey with new data"""
        try:
            async with httpx.AsyncClient() as client:
                for biomarker, value in lab_data.items():
                    if isinstance(value, (int, float)):
                        journey_data = {
                            "session_id": session_id,
                            "biomarker_type": biomarker,
                            "biomarker_value": float(value),
                            "ray_peat_interpretation": rag_response.get('analysis', '')[:500],
                            "recommendations": self._extract_recommendations(rag_response.get('analysis', '')),
                            "metadata": {
                                "sources": rag_response.get('sources', []),
                                "contextual_analysis": True,
                                "analysis_timestamp": datetime.now().isoformat()
                            }
                        }
                        await client.post(f"{self.memory_url}/health-journey/{user_id}", json=journey_data)
                        
        except Exception as e:
            logger.error(f"Health journey update error: {e}")
    
    def _extract_recommendations(self, analysis_text: str) -> List[str]:
        """Extract recommendations from analysis text"""
        # Simple extraction - look for recommendation keywords
        lines = analysis_text.split('\n')
        recommendations = []
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'consider', 'try', 'increase', 'decrease', 'avoid']):
                if len(line) > 10:  # Avoid very short lines
                    recommendations.append(line)
        
        return recommendations[:5]  # Top 5 recommendations
    
    async def _check_memory_service(self) -> Dict[str, Any]:
        """Check memory service health"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.memory_url}/health")
                if response.status_code == 200:
                    return {"status": "healthy", "details": response.json()}
                else:
                    return {"status": "unhealthy", "code": response.status_code}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def _check_rag_service(self) -> Dict[str, Any]:
        """Check RAG service health"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.rag_url}/health")
                if response.status_code == 200:
                    return {"status": "healthy"}
                else:
                    return {"status": "unhealthy", "code": response.status_code}
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Initialize the memory-enhanced API
memory_api = MemoryEnhancedAPI()
app = memory_api.app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)

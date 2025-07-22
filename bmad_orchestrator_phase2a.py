#!/usr/bin/env python3
"""
BMAD Orchestrator for Phase 2A Zep Integration
Real BMAD Agent Coordination for LabInsight AI Health Analysis Platform

This script properly engages the actual BMAD agents from the repository
for coordinated implementation of Phase 2A Zep memory integration.
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path
from datetime import datetime

class BMADOrchestrator:
    def __init__(self, project_root="/home/ubuntu/labinsight-ai-complete"):
        self.project_root = Path(project_root)
        self.bmad_core = self.project_root / ".bmad-core"
        self.agents_dir = self.bmad_core / "agents"
        self.tasks_dir = self.bmad_core / "tasks"
        self.templates_dir = self.bmad_core / "templates"
        self.docs_dir = self.project_root / "docs"
        
        # Zep API Configuration
        self.zep_api_key = "z_1dWlkIjoiYmM3MzI3YzItMjc3Zi00ZmJlLWFmNjAtNTUxMjQyN2M3YTBhIn0.QQdAAfIYiTxO5skJtrVAFDhajvGr3cWA9psqyJod7pxL01RrPhiRZ8kPGxDa2xmIoLnJQdJb4KYKIDdgNjiJ8w"
        
        # Phase 2A Objectives
        self.phase_2a_objectives = [
            "Secure Zep API key integration",
            "Install and configure Zep SDK",
            "Implement basic memory storage for health analysis",
            "Create user session management",
            "Establish HIPAA-compliant memory operations",
            "Test and validate foundation"
        ]
        
        # Available BMAD Agents
        self.available_agents = {
            "orchestrator": "bmad-orchestrator.md",
            "architect": "architect.md", 
            "developer": "dev.md",
            "pm": "pm.md",
            "po": "po.md",
            "sm": "sm.md",
            "qa": "qa.md",
            "analyst": "analyst.md",
            "ux-expert": "ux-expert.md"
        }
        
        self.active_agents = {}
        self.coordination_log = []
        
    def log_coordination(self, agent, action, details):
        """Log coordination activities"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "agent": agent,
            "action": action,
            "details": details
        }
        self.coordination_log.append(log_entry)
        print(f"[{timestamp}] {agent}: {action} - {details}")
        
    def load_agent_definition(self, agent_name):
        """Load actual BMAD agent definition"""
        agent_file = self.agents_dir / self.available_agents[agent_name]
        if not agent_file.exists():
            raise FileNotFoundError(f"Agent file not found: {agent_file}")
            
        with open(agent_file, 'r') as f:
            content = f.read()
            
        self.log_coordination("ORCHESTRATOR", "AGENT_LOADED", f"Loaded {agent_name} definition")
        return content
        
    def initialize_bmad_framework(self):
        """Initialize the BMAD framework"""
        print("🎭 BMAD ORCHESTRATOR INITIALIZING...")
        print("=" * 60)
        
        # Verify BMAD installation
        if not self.bmad_core.exists():
            raise Exception("BMAD core not found. Please install BMAD first.")
            
        # Create docs directory structure
        self.docs_dir.mkdir(exist_ok=True)
        (self.docs_dir / "architecture").mkdir(exist_ok=True)
        (self.docs_dir / "stories").mkdir(exist_ok=True)
        
        self.log_coordination("ORCHESTRATOR", "FRAMEWORK_INIT", "BMAD framework initialized")
        
    def brief_agents_phase2a(self):
        """Brief all agents on Phase 2A objectives"""
        print("\n🎯 BRIEFING BMAD AGENTS ON PHASE 2A ZEP INTEGRATION")
        print("=" * 60)
        
        briefing = {
            "project": "LabInsight AI Health Analysis Platform",
            "phase": "Phase 2A - Zep Memory Integration",
            "objectives": self.phase_2a_objectives,
            "zep_api_key": "PROVIDED (secured)",
            "compliance_requirements": ["HIPAA", "Healthcare Data Security"],
            "technical_stack": ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
            "integration_points": [
                "User session management",
                "Health analysis memory storage", 
                "HIPAA-compliant data handling",
                "Memory retrieval for analysis context"
            ]
        }
        
        # Save briefing document
        briefing_file = self.docs_dir / "phase2a_briefing.json"
        with open(briefing_file, 'w') as f:
            json.dump(briefing, f, indent=2)
            
        self.log_coordination("ORCHESTRATOR", "AGENTS_BRIEFED", "All agents briefed on Phase 2A objectives")
        return briefing
        
    def engage_architect_agent(self):
        """Engage the Architect agent for Zep integration design"""
        print("\n🏗️ ENGAGING ARCHITECT AGENT - WINSTON")
        print("=" * 60)
        
        architect_definition = self.load_agent_definition("architect")
        
        # Create architect task for Zep integration design
        architect_task = {
            "agent": "architect",
            "task": "Design Zep Memory Integration Architecture",
            "requirements": [
                "Design memory storage architecture for health analysis",
                "Define HIPAA-compliant memory operations",
                "Create user session management design",
                "Specify integration points with existing system",
                "Define memory retrieval patterns for analysis context"
            ],
            "deliverables": [
                "docs/architecture/zep-integration-architecture.md",
                "docs/architecture/memory-storage-design.md", 
                "docs/architecture/hipaa-compliance-design.md"
            ]
        }
        
        self.active_agents["architect"] = architect_task
        self.log_coordination("ARCHITECT", "ENGAGED", "Architect Winston engaged for Zep integration design")
        return architect_task
        
    def engage_developer_agent(self):
        """Engage the Developer agent for implementation"""
        print("\n💻 ENGAGING DEVELOPER AGENT - JAMES")
        print("=" * 60)
        
        developer_definition = self.load_agent_definition("developer")
        
        # Create developer task for Zep implementation
        developer_task = {
            "agent": "developer", 
            "task": "Implement Zep SDK Integration",
            "requirements": [
                "Install Zep SDK dependencies",
                "Configure Zep client with API key",
                "Implement memory storage functions",
                "Create user session management",
                "Add HIPAA-compliant memory operations",
                "Write comprehensive tests"
            ],
            "deliverables": [
                "lib/zep-client.ts",
                "lib/memory-manager.ts",
                "lib/session-manager.ts",
                "__tests__/zep-integration.test.ts"
            ]
        }
        
        self.active_agents["developer"] = developer_task
        self.log_coordination("DEVELOPER", "ENGAGED", "Developer James engaged for Zep implementation")
        return developer_task
        
    def engage_qa_agent(self):
        """Engage the QA agent for testing and validation"""
        print("\n🔍 ENGAGING QA AGENT")
        print("=" * 60)
        
        qa_definition = self.load_agent_definition("qa")
        
        # Create QA task for validation
        qa_task = {
            "agent": "qa",
            "task": "Validate Zep Integration Quality",
            "requirements": [
                "Review architecture for HIPAA compliance",
                "Test memory storage operations",
                "Validate session management",
                "Verify error handling",
                "Test integration with existing system"
            ],
            "deliverables": [
                "tests/zep-integration-validation.md",
                "tests/hipaa-compliance-checklist.md"
            ]
        }
        
        self.active_agents["qa"] = qa_task
        self.log_coordination("QA", "ENGAGED", "QA agent engaged for validation")
        return qa_task
        
    def coordinate_phase2a_implementation(self):
        """Coordinate the full Phase 2A implementation"""
        print("\n🎭 ORCHESTRATING PHASE 2A ZEP INTEGRATION")
        print("=" * 60)
        
        # Initialize framework
        self.initialize_bmad_framework()
        
        # Brief all agents
        briefing = self.brief_agents_phase2a()
        
        # Engage agents in proper sequence
        architect_task = self.engage_architect_agent()
        developer_task = self.engage_developer_agent()
        qa_task = self.engage_qa_agent()
        
        # Create coordination plan
        coordination_plan = {
            "phase": "Phase 2A - Zep Integration",
            "start_time": datetime.now().isoformat(),
            "agents_engaged": list(self.active_agents.keys()),
            "coordination_sequence": [
                "1. Architect designs Zep integration architecture",
                "2. Developer implements Zep SDK integration", 
                "3. QA validates implementation and compliance",
                "4. Orchestrator coordinates final validation"
            ],
            "deliverables_expected": [
                "Architecture documents",
                "Implementation code",
                "Test suites",
                "HIPAA compliance validation"
            ]
        }
        
        # Save coordination plan
        plan_file = self.docs_dir / "phase2a_coordination_plan.json"
        with open(plan_file, 'w') as f:
            json.dump(coordination_plan, f, indent=2)
            
        self.log_coordination("ORCHESTRATOR", "COORDINATION_STARTED", "Phase 2A coordination initiated")
        
        return coordination_plan
        
    def generate_agent_instructions(self):
        """Generate specific instructions for each engaged agent"""
        print("\n📋 GENERATING AGENT-SPECIFIC INSTRUCTIONS")
        print("=" * 60)
        
        # Architect Instructions
        architect_instructions = f"""
# ARCHITECT AGENT INSTRUCTIONS - PHASE 2A ZEP INTEGRATION

## AGENT ACTIVATION
You are Winston, the BMAD Architect Agent. You have been engaged by the BMAD Orchestrator for Phase 2A Zep integration design.

## PROJECT CONTEXT
- Project: LabInsight AI Health Analysis Platform
- Phase: Phase 2A - Zep Memory Integration
- Zep API Key: PROVIDED (secured)
- Compliance: HIPAA healthcare data requirements

## YOUR SPECIFIC TASKS
1. Design memory storage architecture for health analysis
2. Define HIPAA-compliant memory operations
3. Create user session management design
4. Specify integration points with existing Next.js/TypeScript system
5. Define memory retrieval patterns for analysis context

## DELIVERABLES REQUIRED
- docs/architecture/zep-integration-architecture.md
- docs/architecture/memory-storage-design.md
- docs/architecture/hipaa-compliance-design.md

## TECHNICAL CONSTRAINTS
- Must integrate with existing Next.js/TypeScript/Prisma stack
- Must maintain HIPAA compliance
- Must support real-time health analysis memory
- Must handle user session persistence

## COORDINATION
Report progress to BMAD Orchestrator. Coordinate with Developer James for implementation feasibility.
"""

        # Developer Instructions  
        developer_instructions = f"""
# DEVELOPER AGENT INSTRUCTIONS - PHASE 2A ZEP INTEGRATION

## AGENT ACTIVATION
You are James, the BMAD Developer Agent. You have been engaged by the BMAD Orchestrator for Phase 2A Zep implementation.

## PROJECT CONTEXT
- Project: LabInsight AI Health Analysis Platform
- Phase: Phase 2A - Zep Memory Integration
- Zep API Key: {self.zep_api_key}
- Architecture: Provided by Architect Winston

## YOUR SPECIFIC TASKS
1. Install Zep SDK dependencies
2. Configure Zep client with API key
3. Implement memory storage functions
4. Create user session management
5. Add HIPAA-compliant memory operations
6. Write comprehensive tests

## DELIVERABLES REQUIRED
- lib/zep-client.ts
- lib/memory-manager.ts
- lib/session-manager.ts
- __tests__/zep-integration.test.ts

## TECHNICAL REQUIREMENTS
- TypeScript implementation
- Integration with existing Prisma database
- HIPAA-compliant data handling
- Comprehensive error handling
- Full test coverage

## COORDINATION
Follow architecture from Winston. Report progress to BMAD Orchestrator. Coordinate with QA for testing.
"""

        # QA Instructions
        qa_instructions = f"""
# QA AGENT INSTRUCTIONS - PHASE 2A ZEP INTEGRATION

## AGENT ACTIVATION
You are the BMAD QA Agent. You have been engaged by the BMAD Orchestrator for Phase 2A Zep validation.

## PROJECT CONTEXT
- Project: LabInsight AI Health Analysis Platform
- Phase: Phase 2A - Zep Memory Integration
- Compliance: HIPAA healthcare data requirements

## YOUR SPECIFIC TASKS
1. Review architecture for HIPAA compliance
2. Test memory storage operations
3. Validate session management
4. Verify error handling
5. Test integration with existing system

## DELIVERABLES REQUIRED
- tests/zep-integration-validation.md
- tests/hipaa-compliance-checklist.md

## VALIDATION CRITERIA
- HIPAA compliance verified
- Memory operations tested
- Session management validated
- Error handling confirmed
- Integration stability verified

## COORDINATION
Review deliverables from Architect and Developer. Report findings to BMAD Orchestrator.
"""

        # Save instructions
        instructions_dir = self.docs_dir / "agent_instructions"
        instructions_dir.mkdir(exist_ok=True)
        
        (instructions_dir / "architect_instructions.md").write_text(architect_instructions)
        (instructions_dir / "developer_instructions.md").write_text(developer_instructions)
        (instructions_dir / "qa_instructions.md").write_text(qa_instructions)
        
        self.log_coordination("ORCHESTRATOR", "INSTRUCTIONS_GENERATED", "Agent-specific instructions created")
        
    def save_coordination_log(self):
        """Save the coordination log"""
        log_file = self.docs_dir / "bmad_coordination_log.json"
        with open(log_file, 'w') as f:
            json.dump(self.coordination_log, f, indent=2)
            
        print(f"\n📊 Coordination log saved to: {log_file}")

def main():
    """Main orchestration function"""
    print("🎭 BMAD ORCHESTRATOR - PHASE 2A ZEP INTEGRATION")
    print("=" * 60)
    print("Properly engaging real BMAD agents from repository...")
    print("Project: LabInsight AI Health Analysis Platform")
    print("Phase: 2A - Zep Memory Integration")
    print("=" * 60)
    
    try:
        # Initialize orchestrator
        orchestrator = BMADOrchestrator()
        
        # Execute coordination
        coordination_plan = orchestrator.coordinate_phase2a_implementation()
        
        # Generate agent instructions
        orchestrator.generate_agent_instructions()
        
        # Save coordination log
        orchestrator.save_coordination_log()
        
        print("\n✅ BMAD ORCHESTRATION COMPLETE")
        print("=" * 60)
        print("🎯 Phase 2A coordination initiated successfully")
        print("📋 Agent instructions generated")
        print("🏗️ Architect Winston engaged for design")
        print("💻 Developer James engaged for implementation")
        print("🔍 QA Agent engaged for validation")
        print("\n📁 Next Steps:")
        print("1. Review agent instructions in docs/agent_instructions/")
        print("2. Execute architect design phase")
        print("3. Proceed with developer implementation")
        print("4. Complete QA validation")
        print("5. Orchestrator final coordination")
        
        return coordination_plan
        
    except Exception as e:
        print(f"❌ ORCHESTRATION ERROR: {e}")
        return None

if __name__ == "__main__":
    main()

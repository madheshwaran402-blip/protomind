import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// ── Re-export all component imports from Viewer ──
import PitchEmailGenerator from '../components/PitchEmailGenerator'
import CircuitSimulator from '../components/CircuitSimulator'
import NetworkingScriptGenerator from '../components/NetworkingScriptGenerator'
import ProductStoryBuilder from '../components/ProductStoryBuilder'
import FinalLaunchChecklist from '../components/FinalLaunchChecklist'
import IdeaValidationScorer from '../components/IdeaValidationScorer'
import RevenueProjection from '../components/RevenueProjection'
import ComponentAgingAnalyser from '../components/ComponentAgingAnalyser'
import QualityControlPlan from '../components/QualityControlPlan'
import EmailCampaignBuilder from '../components/EmailCampaignBuilder'
import TRLAssessment from '../components/TRLAssessment'
import SalesChannelPlanner from '../components/SalesChannelPlanner'
import CostReductionAnalyser from '../components/CostReductionAnalyser'
import HardwareVersionHistory from '../components/HardwareVersionHistory'
import PostLaunchPlanner from '../components/PostLaunchPlanner'
import BetaProgramDesigner from '../components/BetaProgramDesigner'
import DataPrivacyGuide from '../components/DataPrivacyGuide'
import InvestorUpdateGenerator from '../components/InvestorUpdateGenerator'
import ProductHuntLaunch from '../components/ProductHuntLaunch'
import TechTransferPackage from '../components/TechTransferPackage'
import FieldTestPlanner from '../components/FieldTestPlanner'
import SalesScriptGenerator from '../components/SalesScriptGenerator'
import PackagingDesigner from '../components/PackagingDesigner'
import WarrantyPolicyGenerator from '../components/WarrantyPolicyGenerator'
import CommunityStrategyBuilder from '../components/CommunityStrategyBuilder'
import HardwareDebugGuide from '../components/HardwareDebugGuide'
import InvestorQAPrep from '../components/InvestorQAPrep'
import MVPScopeDefiner from '../components/MVPScopeDefiner'
import CodeStyleGuide from '../components/CodeStyleGuide'
import ErrorHandlingGuide from '../components/ErrorHandlingGuide'
import APIDocGenerator from '../components/APIDocGenerator'
import DevEnvironmentSetup from '../components/DevEnvironmentSetup'
import AccessibilityAuditor from '../components/AccessibilityAuditor'
import LaunchCountdownPlanner from '../components/LaunchCountdownPlanner'
import PartnershipFinder from '../components/PartnershipFinder'
import LocalizationPlanner from '../components/LocalizationPlanner'
import TechDebtTracker from '../components/TechDebtTracker'
import PricingPsychologyAnalyser from '../components/PricingPsychologyAnalyser'
import ExitStrategyPlanner from '../components/ExitStrategyPlanner'
import MetricsDashboardDesigner from '../components/MetricsDashboardDesigner'
import OnboardingFlowBuilder from '../components/OnboardingFlowBuilder'
import NameValidator from '../components/NameValidator'
import ABTestPlanner from '../components/ABTestPlanner'
import KnowledgeBaseBuilder from '../components/KnowledgeBaseBuilder'
import PressReleaseGenerator from '../components/PressReleaseGenerator'
import StakeholderMap from '../components/StakeholderMap'
import RapidPrototypeAdvisor from '../components/RapidPrototypeAdvisor'
import NoiseEmiAnalyser from '../components/NoiseEmiAnalyser'
import ConfigFileGenerator from '../components/ConfigFileGenerator'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import ExplainerVideoScript from '../components/ExplainerVideoScript'
import InterviewPrepCoach from '../components/InterviewPrepCoach'
import SustainabilityReport from '../components/SustainabilityReport'
import GrantFinder from '../components/GrantFinder'
import MonetisationStrategist from '../components/MonetisationStrategist'
import SupplyChainAnalyser from '../components/SupplyChainAnalyser'
import DemoScriptGenerator from '../components/DemoScriptGenerator'
import FeedbackFormBuilder from '../components/FeedbackFormBuilder'
import EnclosureDesigner from '../components/EnclosureDesigner'
import ProductChecklist from '../components/ProductChecklist'
import PartsSubstitutionFinder from '../components/PartsSubstitutionFinder'
import WiringDiagramDescriber from '../components/WiringDiagramDescriber'
import GlossaryBuilder from '../components/GlossaryBuilder'
import ChangelogGenerator from '../components/ChangelogGenerator'
import UserStoryGenerator from '../components/UserStoryGenerator'
import DependencyMapper from '../components/DependencyMapper'
import UnitTestGenerator from '../components/UnitTestGenerator'
import CustomerPersonas from '../components/CustomerPersonas'
import FeatureRoadmap from '../components/FeatureRoadmap'
import ProtocolDecoder from '../components/ProtocolDecoder'
import CalibrationGuide from '../components/CalibrationGuide'
import SensorFusionPlanner from '../components/SensorFusionPlanner'
import SecurityAudit from '../components/SecurityAudit'
import MemoryStoragePlanner from '../components/MemoryStoragePlanner'
import WirelessRangeCalculator from '../components/WirelessRangeCalculator'
import PowerBudget from '../components/PowerBudget'
import InvestorPitch from '../components/InvestorPitch'
import SignalIntegrityChecker from '../components/SignalIntegrityChecker'
import ReviewGenerator from '../components/ReviewGenerator'
import CodeTranslator from '../components/CodeTranslator'
import ErrorDecoder from '../components/ErrorDecoder'
import DocumentationWriter from '../components/DocumentationWriter'
import ThermalManagement from '../components/ThermalManagement'
import CrowdfundingBuilder from '../components/CrowdfundingBuilder'
import OTAPlanner from '../components/OTAPlanner'
import BatteryManagement from '../components/BatteryManagement'
import SprintPlanner from '../components/SprintPlanner'
import ManufacturingGuide from '../components/ManufacturingGuide'
import ComplianceChecker from '../components/ComplianceChecker'
import PatentResearch from '../components/PatentResearch'
import AccessibilityChecker from '../components/AccessibilityChecker'
import SocialContentGenerator from '../components/SocialContentGenerator'
import CompetitionResearch from '../components/CompetitionResearch'
import InventorySync from '../components/InventorySync'
import IoTDashboard from '../components/IoTDashboard'
import CostTracker from '../components/CostTracker'
import LearningPath from '../components/LearningPath'
import SimulationMode from '../components/SimulationMode'
import HackathonPack from '../components/HackathonPack'
import APIPlanner from '../components/APIPlanner'
import NamingGenerator from '../components/NamingGenerator'
import DatasheetGenerator from '../components/DatasheetGenerator'
import CodeReviewer from '../components/CodeReviewer'
import TeamCollaboration from '../components/TeamCollaboration'
import AIMentor from '../components/AIMentor'
import HealthMonitor from '../components/HealthMonitor'
import ChallengeGenerator from '../components/ChallengeGenerator'
import GreenAdvisor from '../components/GreenAdvisor'
import PitchBuilder from '../components/PitchBuilder'
import PCBFootprintFinder from '../components/PCBFootprintFinder'
import CostOptimizer from '../components/CostOptimizer'
import DeploymentChecklist from '../components/DeploymentChecklist'
import ConnectionDiagram from '../components/ConnectionDiagram'
import LibraryFinder from '../components/LibraryFinder'
import LabelMaker from '../components/LabelMaker'
import ExportBundle from '../components/ExportBundle'
import ContextChat from '../components/ContextChat'
import FeedbackCollector from '../components/FeedbackCollector'
import WordDocGenerator from '../components/WordDocGenerator'
import ComponentComparisonTable from '../components/ComponentComparisonTable'
import ProgressTracker from '../components/ProgressTracker'
import NotesEditor from '../components/NotesEditor'
import PowerSupplyDesigner from '../components/PowerSupplyDesigner'
import CalibrationTool from '../components/CalibrationTool'
import SubstitutionFinder from '../components/SubstitutionFinder'
import TestSuite from '../components/TestSuite'
import CodeGenerator2 from '../components/CodeGenerator2'
import SlidesGenerator from '../components/SlidesGenerator'
import CommentSystem from '../components/CommentSystem'
import PCBHelper from '../components/PCBHelper'
import TimelinePlanner from '../components/TimelinePlanner'
import WiringGuide from '../components/WiringGuide'
import CompatibilityChecker from '../components/CompatibilityChecker'
import TeamReportGenerator from '../components/TeamReportGenerator'
import LaunchReadiness from '../components/LaunchReadiness'
import RiskAssessment from '../components/RiskAssessment'
import EnergyAudit from '../components/EnergyAudit'
import SimulationRunner from '../components/SimulationRunner'
import BOMOptimizer from '../components/BOMOptimizer'
import ReadmeGenerator from '../components/ReadmeGenerator'
import VersionHistory from '../components/VersionHistory'
import SpecSheetGenerator from '../components/SpecSheetGenerator'
import StockChecker from '../components/StockChecker'
import PrototypeTroubleshooter from '../components/PrototypeTroubleshooter'
import BuildLog from '../components/BuildLog'
import ComplexityAnalyser from '../components/ComplexityAnalyser'
import BudgetPlanner from '../components/BudgetPlanner'
import PrototypeQuiz from '../components/PrototypeQuiz'
import VideoScriptGenerator from '../components/VideoScriptGenerator'
import DocumentationGenerator from '../components/DocumentationGenerator'
import LearningRoadmap from '../components/LearningRoadmap'
import ShoppingListGenerator from '../components/ShoppingListGenerator'
import NameGenerator from '../components/NameGenerator'
import PCBPlanner from '../components/PCBPlanner'
import ImprovementSuggester from '../components/ImprovementSuggester'
import BuildTimeline from '../components/BuildTimeline'
import ShareModal from '../components/ShareModal'
import AIChat from '../components/AIChat'
import MissingComponents from '../components/MissingComponents'
import DifficultyPanel from '../components/DifficultyPanel'
import PowerCalculator from '../components/PowerCalculator'
import SafetyChecklist from '../components/SafetyChecklist'
import SubstitutionSuggester from '../components/SubstitutionSuggester'
import PrototypeComparison from '../components/PrototypeComparison'
import PrototypeExplainer from '../components/PrototypeExplainer'
import CostEstimator from '../components/CostEstimator'
import PrototypeNotes from '../components/PrototypeNotes'
import AccordionSection from '../components/AccordionSection'
import EnclosureCustomizer from '../components/EnclosureCustomizer'
import ModelExportPanel from '../components/ModelExportPanel'
import BreadboardView from '../components/BreadboardView'
import PinAssignmentEditor from '../components/PinAssignmentEditor'
import CodeGenerator from '../components/CodeGenerator'
import ComponentSearch from '../components/ComponentSearch'
import ComponentComparison from '../components/ComponentComparison'
import DatasheetViewer from '../components/DatasheetViewer'
import PrototypeRating from '../components/PrototypeRating'
import { saveProjectCloud, getUser } from '../services/supabase'
import CircuitDiagram from '../components/CircuitDiagram'
import { downloadBOM, generateBOMCSV } from '../services/bomExport'
import ComponentDetail from '../components/ComponentDetail'
import { analyse3DPrintingNeed } from '../services/claude'
import { downloadSTL } from '../services/stlExport'
import { saveProject } from '../services/storage'
import { validatePrototype } from '../services/validation'
import { generatePrototypePDF } from '../services/pdfExport'
import { notify } from '../services/toast'
import ValidationPanel from '../components/ValidationPanel'
import ChangeValidator from '../components/ChangeValidator'
import { Suspense, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stars, Html } from '@react-three/drei'
import StepBar from '../components/StepBar'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'

// ── AccordionSection component ────────────────────────────────────────────────
function AccordionSection({ icon, title, subtitle, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={"rounded-2xl border transition-all duration-200 overflow-hidden " + (open ? "border-indigo-700 bg-[#0a0a1e]" : "border-[#1e1e2e] bg-[#0d0d1a] hover:border-indigo-900")}>
      <button
        onClick={function() { setOpen(function(o) { return !o }) }}
        className="w-full flex items-start gap-4 p-4 text-left">
        <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base">{title}</p>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className={"w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all " + (open ? "bg-indigo-600 text-white" : "bg-[#1e1e2e] text-slate-400")}>
          <span className="text-sm font-bold">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1 border-t border-[#1e1e2e]">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Category definitions with feature lists ────────────────────────────────
const CATEGORY_META = {
  'design-build': {
    name: 'Design & Build',
    icon: '🔧',
    color: '#f97316',
    desc: 'Circuit design, wiring, power analysis, component specs, PCB planning',
  },
  'code-dev': {
    name: 'Code & Dev',
    icon: '💻',
    color: '#6366f1',
    desc: 'Code generation, debugging, documentation, APIs, firmware development',
  },
  'testing-qa': {
    name: 'Testing & QA',
    icon: '🧪',
    color: '#06b6d4',
    desc: 'Testing, validation, compliance, quality control, field testing',
  },
  'business': {
    name: 'Business',
    icon: '📈',
    color: '#22c55e',
    desc: 'Investor pitch, revenue, sales, launch strategy, market analysis',
  },
  'planning': {
    name: 'Planning',
    icon: '📋',
    color: '#a855f7',
    desc: 'Sprint planning, BOM, supply chain, timeline, roadmap, manufacturing',
  },
  'content': {
    name: 'Content & Scripts',
    icon: '📢',
    color: '#f59e0b',
    desc: 'Video scripts, press releases, social media, pitch content, marketing',
  },
  'learn-share': {
    name: 'Learn & Share',
    icon: '🎓',
    color: '#ef4444',
    desc: 'AI mentor, quizzes, community, notes, prototyping guidance',
  },
}

const CATEGORY_FEATURES = {
  'design-build': [
    { icon: '🔍', title: 'Component Inspector', subtitle: 'Search, filter and highlight components' },
    { icon: '📄', title: 'Datasheet Viewer', subtitle: 'Look up specs, pinout and code examples for any component' },
    { icon: '🔗', title: 'Compatibility Checker', subtitle: 'Check voltage, protocol and pin conflicts between all components' },
    { icon: '🚀', title: 'AI Improvement Suggester', subtitle: 'Get ranked suggestions to improve your prototype' },
    { icon: '📡', title: 'Signal Integrity Checker', subtitle: 'Check SPI, I2C, UART signals for integrity issues with PCB layout tips' },
    { icon: '🔬', title: 'Prototype Health Analyser', subtitle: 'AI grades your design across 5 engineering dimensions' },
    { icon: '📶', title: 'Wireless Range Calculator', subtitle: 'Compare WiFi, Bluetooth, LoRa range and performance for your prototype' },
    { icon: '🔴', title: 'Wiring Diagram', subtitle: 'Complete pin-by-pin wiring instructions with wire colors and power connections' },
    { icon: '📦', title: 'Enclosure Designer', subtitle: 'Design physical housing with cutouts, IP rating and manufacturing options' },
    { icon: '🔌', title: 'Connection Diagram', subtitle: 'AI generates pin-by-pin wiring with wire colors and communication buses' },
    { icon: '🔌', title: 'Protocol Decoder', subtitle: 'Decode I2C, SPI, UART protocols with pinout tables and timing diagrams' },
    { icon: '🌡️', title: 'Thermal Management', subtitle: 'Identify thermal hotspots and design cooling solutions with PCB layout tips' },
    { icon: '🔬', title: 'Sensor Fusion Planner', subtitle: 'Plan Kalman filter and other algorithms to combine multiple sensor streams' },
    { icon: '🔄', title: 'Parts Substitution Finder', subtitle: 'Find drop-in and compatible alternative components with price comparison' },
    { icon: '💾', title: 'Memory & Storage Planner', subtitle: 'Plan RAM, Flash and storage layout with usage breakdown and optimisation tips' },
    { icon: '🔋', title: 'Battery Management System', subtitle: 'Design complete BMS with battery selection, charging circuit and runtime estimates' },
    { icon: '💊', title: 'Component Health Monitor', subtitle: 'Analyse component lifespan, failure modes and maintenance schedule' },
    { icon: '⚡', title: 'Simulation Mode', subtitle: 'Simulate power-on, fault, thermal and other scenarios step by step' },
    { icon: '🌿', title: 'Green Build Advisor', subtitle: 'Analyse power consumption and get eco-friendly design recommendations' },
    { icon: '⚖️', title: 'Component Comparison', subtitle: 'Compare any two components side by side with AI analysis' },
    { icon: '📊', title: 'Sensor Calibration', subtitle: 'Enter sensor readings and AI validates calibration with step-by-step fixes' },
    { icon: '⚡', title: 'Power Budget Calculator', subtitle: 'Calculate current and power draw for every component with voltage rail breakdown' },
    { icon: '🔍', title: 'PCB Footprint Finder', subtitle: 'Find KiCad and Altium footprints for all components with one-click copy' },
    { icon: '📊', title: 'Component Comparison Table', subtitle: 'Side-by-side spec comparison of any components with winners and CSV export' },
    { icon: '🖨️', title: 'Custom Enclosure Builder', subtitle: 'Choose enclosure type, color, material and export STL' },
    { icon: '📦', title: 'Enclosure Designer', subtitle: 'AI designs a custom enclosure with dimensions, cutouts and 3D print settings' },
    { icon: '📐', title: '3D Model Export', subtitle: 'Export as OBJ, GLTF or estimate 3D print cost' },
    { icon: '🔌', title: 'Breadboard View', subtitle: 'Visual wiring guide for physical breadboard building' },
    { icon: '📐', title: 'Wiring Guide', subtitle: 'Step-by-step wiring with exact pin connections and wire colours' },
    { icon: '🖥️', title: 'PCB Layout Planner', subtitle: 'AI designs PCB component placement and trace routing' },
    { icon: '📐', title: 'PCB Design Guide', subtitle: 'Complete checklist and ordering guide for taking your design to PCB' },
    { icon: '📌', title: 'Pin Assignment Editor', subtitle: 'Assign and validate microcontroller pin connections' },
    { icon: '⚡', title: 'Circuit Diagram', subtitle: 'AI-generated wiring diagram with colored connections' },
    { icon: '⚡', title: 'Power Supply Designer', subtitle: 'Design power circuits with voltage divider, regulator and battery life calculators' },
    { icon: '🔄', title: 'Component Substitution', subtitle: 'Find alternatives for any unavailable or expensive component' },
    { icon: '🔄', title: 'Substitution Finder 2.0', subtitle: 'AI finds the best alternative components with compatibility scores and pin mapping' },
    { icon: '🔋', title: 'Power Calculator', subtitle: 'Calculate current draw, battery life, and power requirements' },
    { icon: '⚡', title: 'Energy Audit', subtitle: 'Calculate exact power consumption and battery life estimates' },
    { icon: '🔍', title: 'Missing Components', subtitle: 'AI scans for missing resistors, capacitors, and protection circuits' },
    { icon: '🏗️', title: 'Architecture Diagram', subtitle: 'System architecture with layers, data flow and ASCII diagram' },
    { icon: '📡', title: 'Noise & EMI Analyser', subtitle: 'Identify EMI risks with shielding and filtering recommendations' },
    { icon: '⚡', title: 'Rapid Prototype Advisor', subtitle: 'Time-boxed build plan with shortcuts, tradeoffs and task tracking' },
    { icon: '⏳', title: 'Component Aging Analyser', subtitle: 'Analyse component lifespan, failure modes and maintenance requirements' },
    { icon: '🔌', title: 'Circuit Simulator', subtitle: 'Live circuit simulation with LED, button, servo, sensor components and serial monitor' },
    { icon: '🎯', title: 'Calibration Guide', subtitle: 'Step-by-step calibration procedures for every sensor with code snippets' },
    { icon: '⇄', title: 'Code Translator', subtitle: 'Translate code between Arduino, MicroPython, CircuitPython and 6 languages' },
    { icon: '🔍', title: 'AI Code Reviewer', subtitle: 'Paste your code for AI review — issues, grade, improvements and optimized snippets' },
    { icon: '📄', title: 'Datasheet Generator', subtitle: 'Generate full AI datasheets with pinout, electrical specs and application notes' },
    { icon: '💻', title: 'Code Generator 2.0', subtitle: 'Generate code in 5 languages — Arduino, MicroPython, CircuitPython, Raspberry Pi, JavaScript' },
    { icon: '🔍', title: 'AI Troubleshooter', subtitle: 'Describe a problem and AI diagnoses causes with step-by-step fixes' },
    { icon: '♿', title: 'Accessibility Checker', subtitle: 'Check your prototype for inclusive design issues with improvement suggestions' },
    { icon: '🛡️', title: 'Risk Assessment', subtitle: 'AI identifies electrical, thermal and safety risks with mitigation steps' },
    { icon: '🛡️', title: 'Safety Checklist', subtitle: 'AI identifies risks and generates a pre-build safety checklist' },
    { icon: '🛡️', title: 'Risk Assessment', subtitle: 'AI identifies technical, safety and regulatory risks with mitigations' },
    { icon: '🔧', title: 'Change Validator', subtitle: 'Validate proposed changes before implementing them' },
    { icon: '🔬', title: 'Virtual Simulation', subtitle: 'Run a virtual test of your prototype to catch issues before building' },
    { icon: '✅', title: 'Product Name Validator', subtitle: 'Score any name on memorability, uniqueness, pronouncability and relevance' },
    { icon: '🚪', title: 'Exit Strategy Planner', subtitle: 'Plan acquisition, IPO and licensing exits with valuation ranges' },
    { icon: '🔄', title: 'Inventory Sync', subtitle: 'Check stock levels and deduct components from inventory when building' },
    { icon: '📦', title: 'Export Bundle', subtitle: 'Download a complete ZIP with README, BOM, wiring guide, code and specs' },
    { icon: '🎯', title: 'Progress Tracker', subtitle: 'Track your prototype journey with milestones and AI encouragement' },
    { icon: '🏷️', title: 'Label Maker', subtitle: 'Design and print labels with QR codes for your prototype enclosure' },
    { icon: '💰', title: 'BOM Cost Optimizer', subtitle: 'Compare AliExpress, Amazon and local prices for every component' },
    { icon: '💰', title: 'Budget Planner', subtitle: 'Set a budget, track spending per component and supplier' },
    { icon: '🛒', title: 'Shopping List Generator', subtitle: 'Complete prioritized shopping list with buy links and prices' },
    { icon: '📦', title: 'Stock Checker', subtitle: 'AI checks component availability, lead times and suggests alternatives' },
    { icon: '🏭', title: 'Supply Chain Analyser', subtitle: 'Analyse component availability, lead times and supply chain risks' },
    { icon: '📄', title: 'Documentation Generator', subtitle: 'AI writes complete technical docs with wiring guide and troubleshooting' },
    { icon: '📊', title: 'IoT Dashboard Builder', subtitle: 'Design a monitoring dashboard with live simulated sensor data' },
    { icon: '🤖', title: 'AI Assistant', subtitle: 'Context-aware chat that knows your prototype components and idea' },
    { icon: '📝', title: 'Notes 2.0', subtitle: 'Rich text notes with categories, tags, colors, pinning and search' },
    { icon: '🧠', title: 'Knowledge Quiz', subtitle: 'Test your understanding of your prototype\'s components and circuits' },
  ],
  'code-dev': [
    { icon: '🧪', title: 'Unit Test Generator', subtitle: 'Generate unit tests for your prototype code with pass/fail tracking' },
    { icon: '📝', title: 'Documentation Writer', subtitle: 'Generate README, API docs, user manual and assembly guide with one click' },
    { icon: '🐛', title: 'Error Code Decoder', subtitle: 'Paste any Arduino or compiler error to get instant explanation and fixes' },
    { icon: '🗂️', title: 'Dependency Mapper', subtitle: 'Map all libraries and dependencies with install commands and license info' },
    { icon: '📝', title: 'Changelog Generator', subtitle: 'Track version history with AI-generated entries and export to CHANGELOG.md' },
    { icon: '📦', title: 'Library Finder', subtitle: 'Find all Arduino libraries with install commands for your prototype' },
    { icon: '🔒', title: 'Security Audit', subtitle: 'Find IoT security vulnerabilities and get hardening recommendations' },
    { icon: '📡', title: 'OTA Update Planner', subtitle: 'Plan over-the-air firmware updates with security features and rollback strategy' },
    { icon: '🔌', title: 'API Integration Planner', subtitle: 'Find cloud APIs and IoT platforms with code snippets for your prototype' },
    { icon: '📅', title: 'Version History Timeline', subtitle: 'Visual timeline of all saved versions with diff comparison' },
    { icon: '🕐', title: 'Version History', subtitle: 'Browse and restore previous versions' },
    { icon: '📋', title: 'Changelog Generator', subtitle: 'AI writes professional release notes from your version history' },
    { icon: '🧪', title: 'Test Suite', subtitle: 'AI generates hardware and software tests with pass/fail tracking' },
    { icon: '⚙️', title: 'Config File Generator', subtitle: 'Generate JSON, YAML, .env and INI config files with download' },
    { icon: '🔧', title: 'Technical Debt Tracker', subtitle: 'Identify and resolve hardware and software technical debt' },
    { icon: '💻', title: 'Dev Environment Setup', subtitle: 'Generate complete dev environment with tools, configs and setup tips' },
    { icon: '📋', title: 'API Doc Generator', subtitle: 'Generate complete API documentation with endpoints, params and examples' },
    { icon: '🚨', title: 'Error Handling Guide', subtitle: 'Generate error codes, detection methods and recovery procedures' },
    { icon: '📐', title: 'Code Style Guide', subtitle: 'Generate coding standards with good/bad examples and linter config' },
    { icon: '🔍', title: 'Hardware Debug Guide', subtitle: 'Symptom-based debugging guide with step-by-step fixes' },
    { icon: '📜', title: 'Hardware Version History', subtitle: 'Document version history with changes, breaking updates and release notes' },
    { icon: '🌱', title: 'Sustainability Report', subtitle: 'Evaluate environmental impact, carbon footprint and sustainability score' },
    { icon: '📔', title: 'Build Log Journal', subtitle: 'Document your daily build progress with mood, tags and milestones' },
    { icon: '📖', title: 'Glossary Builder', subtitle: 'Build a searchable technical glossary with categories and related terms' },
    { icon: '📝', title: 'Word Document Generator', subtitle: 'Generate a professional .docx report for Word, Google Docs or LibreOffice' },
    { icon: '📝', title: 'GitHub README Generator', subtitle: 'Generate a professional README.md for your GitHub repository' },
    { icon: '📋', title: 'Technical Spec Sheet', subtitle: 'Generate a professional engineering specification document' },
    { icon: '📚', title: 'Knowledge Base Builder', subtitle: 'Build a searchable KB with setup guides, troubleshooting articles and FAQs' },
  ],
  'testing-qa': [
    { icon: '🚀', title: 'Launch Readiness', subtitle: 'Get a Go/No-Go verdict with a complete deployment checklist' },
    { icon: '🚀', title: 'Product Launch Checklist', subtitle: 'Complete checklist to go from prototype to shippable product' },
    { icon: '🚀', title: 'Deployment Checklist', subtitle: 'AI generates launch readiness checklist with critical items and progress tracking' },
    { icon: '📋', title: 'Regulatory Compliance', subtitle: 'Check CE, FCC, RoHS and other certifications required for your target region' },
    { icon: '📜', title: 'Patent Research', subtitle: 'Research patentability, potential claims and prior art for your prototype' },
    { icon: '📝', title: 'Feedback Form Builder', subtitle: 'Generate user feedback forms with ratings, multiple choice and response tracking' },
    { icon: '🔬', title: 'A/B Test Planner', subtitle: 'Plan rigorous A/B tests to validate hardware and design decisions' },
    { icon: '♿', title: 'Accessibility Auditor', subtitle: 'Audit for accessibility issues with scoring and inclusive design recommendations' },
    { icon: '🎯', title: 'MVP Scope Definer', subtitle: 'Define MVP scope with MoSCoW prioritisation and validation goals' },
    { icon: '🧪', title: 'Field Test Planner', subtitle: 'Plan field tests with procedures, pass/fail criteria and result tracking' },
    { icon: '🔬', title: 'TRL Assessment', subtitle: 'Assess Technology Readiness Level 1-9 with gaps and advancement path' },
    { icon: '✅', title: 'Quality Control Plan', subtitle: 'Generate QC checkpoints with test methods and pass/fail criteria' },
    { icon: '💡', title: 'Idea Validation Scorer', subtitle: 'Score your idea across market, technical, financial and feasibility dimensions' },
    { icon: '🚀', title: 'Final Launch Checklist', subtitle: 'The definitive pre-launch checklist covering every critical item' },
    { icon: '🚀', title: 'Launch Countdown Planner', subtitle: 'Milestone-based launch countdown with tasks and progress tracking' },
    { icon: '🚀', title: 'Product Hunt Launch', subtitle: 'Generate tagline, description, maker comment and launch day schedule' },
    { icon: '🔐', title: 'Data Privacy Guide', subtitle: 'Generate GDPR checklist, data inventory and privacy by design' },
    { icon: '📈', title: 'Post-Launch Planner', subtitle: 'Plan Week 1, Month 1, Month 3 actions with KPIs and issue handling' },
    { icon: '💸', title: 'Cost Reduction Analyser', subtitle: 'Find opportunities to reduce BOM and production costs with risk assessment' },
    { icon: '✉️', title: 'Email Campaign Builder', subtitle: 'Generate complete email sequence for product launch' },
    { icon: '🏭', title: 'Manufacturing Guide', subtitle: 'Get scaling options, process steps, quality checks and supplier recommendations' },
    { icon: '📰', title: 'Press Release Generator', subtitle: 'Generate professional press releases for product launches and milestones' },
    { icon: '💬', title: 'Prototype Feedback', subtitle: 'Log what worked, what didn\'t, and lessons learned' },
    { icon: '📋', title: 'Feedback Collector', subtitle: 'Create surveys to collect structured feedback from prototype testers' },
    { icon: '⚖️', title: 'Prototype Comparison', subtitle: 'Compare your prototype against an AI-generated alternative' },
    { icon: '💬', title: 'Community Comments', subtitle: 'Leave feedback and discuss this prototype with the community' },
  ],
  'business': [
    { icon: '🚀', title: 'Crowdfunding Campaign', subtitle: 'Build a complete Kickstarter campaign with reward tiers, story and platform recommendations' },
    { icon: '✨', title: 'Brand Kit Generator', subtitle: 'AI creates product names, taglines, colors and pitch' },
    { icon: '📧', title: 'Pitch Email Generator', subtitle: 'Generate targeted pitch emails for investors, manufacturers, press and partners' },
    { icon: '💼', title: 'Investor Pitch', subtitle: 'Generate complete investor pitch with financials, market size and use of funds breakdown' },
    { icon: '👥', title: 'Customer Personas', subtitle: 'Generate realistic user personas with goals, pain points and willingness to pay' },
    { icon: '🎯', title: 'Pitch Builder', subtitle: 'Build a compelling elevator pitch and practice interview Q&A' },
    { icon: '🔍', title: 'Competition Research', subtitle: 'AI researches similar products, market gaps and your competitive advantages' },
    { icon: '💰', title: 'Monetisation Strategist', subtitle: 'Build revenue streams, pricing tiers and go-to-market strategy' },
    { icon: '💵', title: 'Grant Finder', subtitle: 'Find relevant grants, funding programs and accelerators for your prototype' },
    { icon: '🎯', title: 'Onboarding Flow Builder', subtitle: 'Design the first-use experience with step-by-step user guidance' },
    { icon: '📊', title: 'Metrics Dashboard Designer', subtitle: 'Define north star metric and KPIs with targets and formula' },
    { icon: '💰', title: 'Pricing Psychology Analyser', subtitle: 'Discover anchoring tactics and psychological pricing strategies' },
    { icon: '🌍', title: 'Localization Planner', subtitle: 'Plan global markets with voltage, plug types and certification requirements' },
    { icon: '🤝', title: 'Partnership Finder', subtitle: 'Find strategic partners with approach strategies and pitch angles' },
    { icon: '💬', title: 'Investor Q&A Prep', subtitle: 'Prepare for tough investor questions with model answers and red flags' },
    { icon: '👥', title: 'Community Strategy Builder', subtitle: 'Build community strategy across platforms with growth tactics' },
    { icon: '📄', title: 'Warranty Policy Generator', subtitle: 'Generate complete warranty, returns and refund policy' },
    { icon: '🗣️', title: 'Sales Script Generator', subtitle: 'Generate complete sales script with objection handling' },
    { icon: '📋', title: 'Tech Transfer Package', subtitle: 'Generate complete tech transfer package for manufacturing or licensing' },
    { icon: '📧', title: 'Investor Update Generator', subtitle: 'Generate monthly investor updates with metrics and highlights' },
    { icon: '🧪', title: 'Beta Program Designer', subtitle: 'Design structured beta program with phases, criteria and incentives' },
    { icon: '🏪', title: 'Sales Channel Planner', subtitle: 'Plan sales channels from direct to marketplace distribution' },
    { icon: '📈', title: 'Revenue Projection', subtitle: 'Project 3-year revenue across optimistic, realistic and pessimistic scenarios' },
    { icon: '🏆', title: 'Hackathon Pack', subtitle: 'Generate complete hackathon submission with pitch, timeline, judge Q&A and team roles' },
    { icon: '💰', title: 'Build Cost Estimator', subtitle: 'Compare prices across Amazon, AliExpress, and local stores' },
    { icon: '🎯', title: 'Interview Prep Coach', subtitle: 'Prepare answers for investor, accelerator and technical interviews with practice mode' },
    { icon: '🤝', title: 'Networking Script Generator', subtitle: 'Generate scripts for conferences, demo days and investor meetings' },
  ],
  'planning': [
    { icon: '🗺️', title: 'Feature Roadmap', subtitle: 'Build a phased product roadmap with priorities and effort estimates' },
    { icon: '🗺️', title: 'Stakeholder Map', subtitle: 'Map all stakeholders with influence levels and engagement strategies' },
    { icon: '💰', title: 'Cost Tracker', subtitle: 'Track actual spending with purchase status, categories and budget alerts' },
    { icon: '📚', title: 'Learning Path', subtitle: 'Personalised learning roadmap based on your skill level with XP tracking' },
    { icon: '🗓️', title: 'Sprint Planner', subtitle: 'AI generates a day-by-day sprint plan with task tracking and progress' },
    { icon: '📋', title: 'User Story Generator', subtitle: 'Generate agile user stories with acceptance criteria and story point estimates' },
    { icon: '🗓️', title: 'Build Timeline', subtitle: 'Track your build progress milestone by milestone' },
    { icon: '📅', title: 'Timeline Planner', subtitle: 'AI generates a Gantt chart with phases, tasks and milestones' },
    { icon: '💰', title: 'Cost Optimizer', subtitle: 'Set a budget and AI finds savings opportunities with priority ranking' },
    { icon: '🗺️', title: 'Learning Roadmap', subtitle: 'Step-by-step learning path to build this prototype successfully' },
    { icon: '📦', title: 'Packaging Designer', subtitle: 'Design product packaging with materials and unboxing experience' },
    { icon: '🎯', title: 'Slide Deck Generator', subtitle: 'AI creates a complete presentation with speaker notes and interactive HTML export' },
  ],
  'content': [
    { icon: '🎬', title: 'Video Script Generator', subtitle: 'AI writes your complete YouTube or TikTok build video script' },
    { icon: '📱', title: 'Social Content Generator', subtitle: 'Generate ready-to-post content for Twitter, Instagram, Reddit, LinkedIn and YouTube' },
    { icon: '📋', title: 'Team Report Generator', subtitle: 'Generate a professional project status report for your team or supervisor' },
    { icon: '🎤', title: 'Demo Script Generator', subtitle: 'Generate live demo scripts with scenes, actions and presentation mode' },
    { icon: '🎬', title: 'Explainer Video Script', subtitle: 'Generate YouTube explainer scripts with hook, B-roll notes and section breakdown' },
    { icon: '📖', title: 'Product Story Builder', subtitle: 'Craft a compelling origin story, problem, solution and vision narrative' },
    { icon: '⭐', title: 'AI Review Generator', subtitle: 'Generate realistic product reviews to understand user perception of your prototype' },
    { icon: '⭐', title: 'Rate This Prototype', subtitle: 'Rate difficulty, time spent and leave a personal review' },
    { icon: '💬', title: 'Prototype Explainer', subtitle: 'Explain your prototype in simple language for any audience' },
  ],
  'learn-share': [
    { icon: '✨', title: 'AI Naming Generator', subtitle: 'Generate creative product names with taglines and domain availability scores' },
    { icon: '👥', title: 'Team Collaboration', subtitle: 'Share updates, assign tasks and manage your build team' },
    { icon: '🧑‍🏫', title: 'AI Mentor', subtitle: 'Structured lessons with analogies, deep dives and common mistakes' },
    { icon: '🎯', title: 'Challenge Generator', subtitle: 'Generate upgrade challenges to level up your prototype skills and earn XP' },
    { icon: '📝', title: 'Prototype Notes', subtitle: 'Build log, next steps, status tracking' },
    { icon: '📊', title: 'Difficulty & Build Time', subtitle: 'AI estimates how hard this is to build and how long it takes' },
  ],
}


function FeaturesPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [idea, setIdea] = useState('')
  const [selectedComponents, setSelectedComponents] = useState([])
  const [openFeature, setOpenFeature] = useState(null)

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) setIdea(req.idea)
      if (req.components) setSelectedComponents(req.components)
    } catch(e) {}
  }, [])

  const cat = CATEGORY_META[categoryId]
  if (!cat) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-4xl mb-4">❌</p>
          <p className="text-xl font-bold mb-2">Category not found</p>
          <button onClick={function(){navigate('/viewer')}} className="px-4 py-2 bg-indigo-600 rounded-xl">← Back to ProtoView</button>
        </div>
      </div>
    )
  }

  const allFeatures = CATEGORY_FEATURES[categoryId] || []
  const filtered = search.trim()
    ? allFeatures.filter(function(f) {
        return f.title.toLowerCase().includes(search.toLowerCase()) ||
               f.subtitle.toLowerCase().includes(search.toLowerCase())
      })
    : allFeatures

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#050510] bg-opacity-95 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={function() { navigate('/viewer') }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm">
              <span>←</span>
              <span>ProtoView</span>
            </button>
            <span className="text-[#2e2e4e]">/</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-white font-black text-lg">{cat.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{backgroundColor: cat.color + '20', color: cat.color}}>
                {allFeatures.length} tools
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input
                value={search}
                onChange={function(e) { setSearch(e.target.value) }}
                placeholder={"Search " + cat.name + " features..."}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
            </div>
            {search && (
              <button onClick={function(){setSearch('')}} className="text-slate-500 hover:text-white text-sm px-3 py-2">Clear</button>
            )}
          </div>

          {/* Context banner */}
          {idea && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
              <span className="text-slate-500">Project:</span>
              <span className="text-slate-300 truncate max-w-xs">{idea.slice(0, 60)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category header card */}
        <div className="rounded-2xl border p-6 mb-6"
          style={{backgroundColor: cat.color + '08', borderColor: cat.color + '30'}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
              style={{backgroundColor: cat.color + '20'}}>
              {cat.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{cat.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{cat.desc}</p>
              <p className="text-xs mt-1" style={{color: cat.color}}>
                {filtered.length} of {allFeatures.length} tools {search ? 'matching' : 'available'}
              </p>
            </div>
          </div>
        </div>

        {/* Features grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-bold text-lg">No results for "{search}"</p>
            <button onClick={function(){setSearch('')}} className="mt-3 text-indigo-400 hover:underline text-sm">Clear search</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-4">
              Click any feature to expand and use it
            </p>
            {filtered.map(function(feature, i) {
              return (
                <AccordionWrapper
                  key={i}
                  icon={feature.icon}
                  title={feature.title}
                  subtitle={feature.subtitle}
                  categoryId={categoryId}
                  idea={idea}
                  selectedComponents={selectedComponents}
                  accentColor={cat.color}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// AccordionWrapper renders the actual feature component based on title
function AccordionWrapper({ icon, title, subtitle, categoryId, idea, selectedComponents, accentColor }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={"rounded-2xl border transition-all duration-200 overflow-hidden " + (open ? "border-indigo-600 shadow-lg shadow-indigo-900/20" : "border-[#1e1e2e] bg-[#0d0d1a] hover:border-indigo-900 hover:bg-[#0a0a1a]")}>
      <button
        onClick={function() { setOpen(function(o) { return !o }) }}
        className="w-full flex items-center gap-4 p-4 text-left">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold">{title}</p>
          {subtitle && <p className="text-slate-500 text-sm truncate">{subtitle}</p>}
        </div>
        <div className={"w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all " + (open ? "text-white" : "bg-[#1e1e2e] text-slate-400")}
          style={open ? {backgroundColor: accentColor} : {}}>
          <span className="text-sm font-bold">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-5 border-t border-[#1e1e2e] pt-4">
          <FeatureContent
            title={title}
            idea={idea}
            selectedComponents={selectedComponents}/>
        </div>
      )}
    </div>
  )
}

// FeatureContent loads the right component based on title
function FeatureContent({ title, idea, selectedComponents }) {
  // Map feature titles to their components
  // This is a simplified version — each component is passed the idea and components
  const t = title


  // All components are imported at the top of this file
  // We map by title to the right component
  const componentMap = {
    'Component Inspector': ComponentSearch,
    'Datasheet Viewer': DatasheetViewer,
    'Compatibility Checker': CompatibilityChecker,
    'AI Improvement Suggester': ImprovementSuggester,
    'Signal Integrity Checker': SignalIntegrityChecker,
    'Prototype Health Analyser': ComplexityAnalyser,
    'Wireless Range Calculator': WirelessRangeCalculator,
    'Wiring Diagram': WiringDiagramDescriber,
    'Enclosure Designer': EnclosureDesigner,
    'Connection Diagram': ConnectionDiagram,
    'Protocol Decoder': ProtocolDecoder,
    'Thermal Management': ThermalManagement,
    'Sensor Fusion Planner': SensorFusionPlanner,
    'Parts Substitution Finder': PartsSubstitutionFinder,
    'Memory & Storage Planner': MemoryStoragePlanner,
    'Battery Management System': BatteryManagement,
    'Component Health Monitor': HealthMonitor,
    'Simulation Mode': SimulationMode,
    'Green Build Advisor': GreenAdvisor,
    'Component Comparison': ComponentComparison,
    'Sensor Calibration': CalibrationTool,
    'Power Budget Calculator': PowerBudget,
    'PCB Footprint Finder': PCBFootprintFinder,
    'Custom Enclosure Builder': EnclosureCustomizer,
    'Enclosure Designer': EnclosureDesigner,
    '3D Model Export': ModelExportPanel,
    'Breadboard View': BreadboardView,
    'Wiring Guide': WiringGuide,
    'PCB Layout Planner': PCBPlanner,
    'PCB Design Guide': PCBHelper,
    'Pin Assignment Editor': PinAssignmentEditor,
    'Circuit Diagram': CircuitDiagram,
    'Power Supply Designer': PowerSupplyDesigner,
    'Component Substitution': SubstitutionSuggester,
    'Substitution Finder 2.0': SubstitutionFinder,
    'Power Calculator': PowerCalculator,
    'Energy Audit': EnergyAudit,
    'Missing Components': MissingComponents,
    'Architecture Diagram': ArchitectureDiagram,
    'Noise & EMI Analyser': NoiseEmiAnalyser,
    'Rapid Prototype Advisor': RapidPrototypeAdvisor,
    'Component Aging Analyser': ComponentAgingAnalyser,
    'Circuit Simulator': CircuitSimulator,
    'Calibration Guide': CalibrationGuide,
    'Code Translator': CodeTranslator,
    'Unit Test Generator': UnitTestGenerator,
    'Documentation Writer': DocumentationWriter,
    'Error Code Decoder': ErrorDecoder,
    'Dependency Mapper': DependencyMapper,
    'Changelog Generator': ChangelogGenerator,
    'Library Finder': LibraryFinder,
    'Security Audit': SecurityAudit,
    'OTA Update Planner': OTAPlanner,
    'API Integration Planner': APIPlanner,
    'AI Code Reviewer': CodeReviewer,
    'Version History Timeline': VersionHistory,
    'Datasheet Generator': DatasheetGenerator,
    'Version History': VersionHistory,
    'Code Generator 2.0': CodeGenerator2,
    'AI Troubleshooter': PrototypeTroubleshooter,
    'Changelog Generator': ChangelogGenerator,
    'Test Suite': TestSuite,
    'Config File Generator': ConfigFileGenerator,
    'Technical Debt Tracker': TechDebtTracker,
    'Dev Environment Setup': DevEnvironmentSetup,
    'API Doc Generator': APIDocGenerator,
    'Error Handling Guide': ErrorHandlingGuide,
    'Code Style Guide': CodeStyleGuide,
    'Hardware Debug Guide': HardwareDebugGuide,
    'Hardware Version History': HardwareVersionHistory,
    'Launch Readiness': LaunchReadiness,
    'Product Launch Checklist': ProductChecklist,
    'Accessibility Checker': AccessibilityChecker,
    'Deployment Checklist': DeploymentChecklist,
    'Regulatory Compliance': ComplianceChecker,
    'Patent Research': PatentResearch,
    'Risk Assessment': RiskAssessment,
    'Safety Checklist': SafetyChecklist,
    'Risk Assessment': RiskAssessment,
    'Change Validator': ChangeValidator,
    'Virtual Simulation': SimulationRunner,
    'Feedback Form Builder': FeedbackFormBuilder,
    'Sustainability Report': SustainabilityReport,
    'A/B Test Planner': ABTestPlanner,
    'Accessibility Auditor': AccessibilityAuditor,
    'MVP Scope Definer': MVPScopeDefiner,
    'Field Test Planner': FieldTestPlanner,
    'TRL Assessment': TRLAssessment,
    'Quality Control Plan': QualityControlPlan,
    'Idea Validation Scorer': IdeaValidationScorer,
    'Final Launch Checklist': FinalLaunchChecklist,
    'Crowdfunding Campaign': CrowdfundingBuilder,
    'Brand Kit Generator': NameGenerator,
    'Pitch Email Generator': PitchEmailGenerator,
    'Investor Pitch': InvestorPitch,
    'Feature Roadmap': FeatureRoadmap,
    'Customer Personas': CustomerPersonas,
    'Pitch Builder': PitchBuilder,
    'AI Naming Generator': NamingGenerator,
    'Competition Research': CompetitionResearch,
    'Monetisation Strategist': MonetisationStrategist,
    'Grant Finder': GrantFinder,
    'Stakeholder Map': StakeholderMap,
    'Product Name Validator': NameValidator,
    'Onboarding Flow Builder': OnboardingFlowBuilder,
    'Metrics Dashboard Designer': MetricsDashboardDesigner,
    'Exit Strategy Planner': ExitStrategyPlanner,
    'Pricing Psychology Analyser': PricingPsychologyAnalyser,
    'Localization Planner': LocalizationPlanner,
    'Partnership Finder': PartnershipFinder,
    'Launch Countdown Planner': LaunchCountdownPlanner,
    'Investor Q&A Prep': InvestorQAPrep,
    'Community Strategy Builder': CommunityStrategyBuilder,
    'Warranty Policy Generator': WarrantyPolicyGenerator,
    'Sales Script Generator': SalesScriptGenerator,
    'Tech Transfer Package': TechTransferPackage,
    'Product Hunt Launch': ProductHuntLaunch,
    'Investor Update Generator': InvestorUpdateGenerator,
    'Data Privacy Guide': DataPrivacyGuide,
    'Beta Program Designer': BetaProgramDesigner,
    'Post-Launch Planner': PostLaunchPlanner,
    'Cost Reduction Analyser': CostReductionAnalyser,
    'Sales Channel Planner': SalesChannelPlanner,
    'Email Campaign Builder': EmailCampaignBuilder,
    'Revenue Projection': RevenueProjection,
    'Inventory Sync': InventorySync,
    'Cost Tracker': CostTracker,
    'Learning Path': LearningPath,
    'Sprint Planner': SprintPlanner,
    'Manufacturing Guide': ManufacturingGuide,
    'User Story Generator': UserStoryGenerator,
    'Export Bundle': ExportBundle,
    'Hackathon Pack': HackathonPack,
    'Build Timeline': BuildTimeline,
    'Timeline Planner': TimelinePlanner,
    'Build Log Journal': BuildLog,
    'Cost Optimizer': CostOptimizer,
    'Progress Tracker': ProgressTracker,
    'Label Maker': LabelMaker,
    'Build Cost Estimator': CostEstimator,
    'BOM Cost Optimizer': BOMOptimizer,
    'Budget Planner': BudgetPlanner,
    'Shopping List Generator': ShoppingListGenerator,
    'Stock Checker': StockChecker,
    'Learning Roadmap': LearningRoadmap,
    'Supply Chain Analyser': SupplyChainAnalyser,
    'Packaging Designer': PackagingDesigner,
    'Video Script Generator': VideoScriptGenerator,
    'Slide Deck Generator': SlidesGenerator,
    'Glossary Builder': GlossaryBuilder,
    'Social Content Generator': SocialContentGenerator,
    'Word Document Generator': WordDocGenerator,
    'Team Report Generator': TeamReportGenerator,
    'Documentation Generator': DocumentationGenerator,
    'GitHub README Generator': ReadmeGenerator,
    'Technical Spec Sheet': SpecSheetGenerator,
    'Demo Script Generator': DemoScriptGenerator,
    'Interview Prep Coach': InterviewPrepCoach,
    'Explainer Video Script': ExplainerVideoScript,
    'Press Release Generator': PressReleaseGenerator,
    'Knowledge Base Builder': KnowledgeBaseBuilder,
    'Product Story Builder': ProductStoryBuilder,
    'Networking Script Generator': NetworkingScriptGenerator,
    'Team Collaboration': TeamCollaboration,
    'AI Mentor': AIMentor,
    'AI Review Generator': ReviewGenerator,
    'Rate This Prototype': PrototypeRating,
    'Prototype Feedback': FeedbackCollector,
    'IoT Dashboard Builder': IoTDashboard,
    'AI Assistant': ContextChat,
    'Challenge Generator': ChallengeGenerator,
    'Prototype Notes': PrototypeNotes,
    'Feedback Collector': FeedbackCollector,
    'Notes 2.0': NotesEditor,
    'Prototype Explainer': PrototypeExplainer,
    'Prototype Comparison': PrototypeComparison,
    'Difficulty & Build Time': DifficultyPanel,
    'Knowledge Quiz': PrototypeQuiz,
  }

  const Component = componentMap[t]
  if (Component) {
    return <Component idea={idea} components={selectedComponents} selectedComponents={selectedComponents}/>
  }

  // Fallback for features without dedicated component
  return (
    <div className="bg-[#0a0a1a] border border-[#1e1e2e] rounded-xl p-6 text-center">
      <p className="text-4xl mb-3">🤖</p>
      <p className="text-white font-bold mb-1">{t}</p>
      <p className="text-slate-500 text-sm mb-4">Start a project first to use this feature</p>
      <a href="/protospec" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition inline-block">
        Start with ProtoSpec →
      </a>
    </div>
  )
}

export default FeaturesPage

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
import EnclosureCustomizer from '../components/EnclosureCustomizer'
import ModelExportPanel from '../components/ModelExportPanel'
import BreadboardView from '../components/BreadboardView'
import PinAssignmentEditor from '../components/PinAssignmentEditor'
import CodeGenerator from '../components/CodeGenerator'
import ComponentSearch from '../components/ComponentSearch'
import ComponentComparison from '../components/ComponentComparison'
import DatasheetViewer from '../components/DatasheetViewer'
import PrototypeRating from '../components/PrototypeRating'
import CircuitDiagram from '../components/CircuitDiagram'
import ComponentDetail from '../components/ComponentDetail'
import ValidationPanel from '../components/ValidationPanel'
import ChangeValidator from '../components/ChangeValidator'
import StepBar from '../components/StepBar'

// ─── CATEGORY METADATA ────────────────────────────────────────────────────────
const CATEGORY_META = {
  'design-build': {
    name: 'Design & Build',
    icon: '🔧',
    color: '#f97316',
    desc: 'Wiring, PCB, power analysis, component specs, circuit simulation',
    count: 0,
  },
  'code-dev': {
    name: 'Code & Dev',
    icon: '💻',
    color: '#6366f1',
    desc: 'Code generation, debugging, documentation, APIs, firmware',
    count: 0,
  },
  'testing-qa': {
    name: 'Testing & QA',
    icon: '🧪',
    color: '#06b6d4',
    desc: 'Testing, validation, compliance, quality control',
    count: 0,
  },
  'business': {
    name: 'Business',
    icon: '📈',
    color: '#22c55e',
    desc: 'Investor pitch, revenue, sales, launch strategy',
    count: 0,
  },
  'planning': {
    name: 'Planning',
    icon: '📋',
    color: '#a855f7',
    desc: 'Sprint planning, BOM, supply chain, roadmap, manufacturing',
    count: 0,
  },
  'content': {
    name: 'Content & Scripts',
    icon: '📢',
    color: '#f59e0b',
    desc: 'Video scripts, press releases, social media, marketing',
    count: 0,
  },
  'learn-share': {
    name: 'Learn & Share',
    icon: '🎓',
    color: '#ef4444',
    desc: 'AI mentor, quizzes, community, notes, guidance',
    count: 0,
  },
}

const CATEGORY_FEATURES = {
  'design-build': [
    { icon: '🔧', title: 'Circuit Simulator', subtitle: 'AI-powered tool for your prototype', comp: CircuitSimulator },
    { icon: '🔧', title: 'Component Aging Analyser', subtitle: 'AI-powered tool for your prototype', comp: ComponentAgingAnalyser },
    { icon: '🔧', title: 'Tech Debt Tracker', subtitle: 'AI-powered tool for your prototype', comp: TechDebtTracker },
    { icon: '🔧', title: 'Rapid Prototype Advisor', subtitle: 'AI-powered tool for your prototype', comp: RapidPrototypeAdvisor },
    { icon: '🔧', title: 'Noise Emi Analyser', subtitle: 'AI-powered tool for your prototype', comp: NoiseEmiAnalyser },
    { icon: '🔧', title: 'Architecture Diagram', subtitle: 'AI-powered tool for your prototype', comp: ArchitectureDiagram },
    { icon: '🔧', title: 'Enclosure Designer', subtitle: 'AI-powered tool for your prototype', comp: EnclosureDesigner },
    { icon: '🔧', title: 'Parts Substitution Finder', subtitle: 'AI-powered tool for your prototype', comp: PartsSubstitutionFinder },
    { icon: '🔧', title: 'Wiring Diagram Describer', subtitle: 'AI-powered tool for your prototype', comp: WiringDiagramDescriber },
    { icon: '🔧', title: 'Protocol Decoder', subtitle: 'AI-powered tool for your prototype', comp: ProtocolDecoder },
    { icon: '🔧', title: 'Calibration Guide', subtitle: 'AI-powered tool for your prototype', comp: CalibrationGuide },
    { icon: '🔧', title: 'Sensor Fusion Planner', subtitle: 'AI-powered tool for your prototype', comp: SensorFusionPlanner },
    { icon: '🔧', title: 'Memory Storage Planner', subtitle: 'AI-powered tool for your prototype', comp: MemoryStoragePlanner },
    { icon: '🔧', title: 'Wireless Range Calculator', subtitle: 'AI-powered tool for your prototype', comp: WirelessRangeCalculator },
    { icon: '🔧', title: 'Power Budget', subtitle: 'AI-powered tool for your prototype', comp: PowerBudget },
    { icon: '🔧', title: 'Signal Integrity Checker', subtitle: 'AI-powered tool for your prototype', comp: SignalIntegrityChecker },
    { icon: '🔧', title: 'Review Generator', subtitle: 'AI-powered tool for your prototype', comp: ReviewGenerator },
    { icon: '🔧', title: 'Thermal Management', subtitle: 'AI-powered tool for your prototype', comp: ThermalManagement },
    { icon: '🔧', title: 'Battery Management', subtitle: 'AI-powered tool for your prototype', comp: BatteryManagement },
    { icon: '🔧', title: 'Simulation Mode', subtitle: 'AI-powered tool for your prototype', comp: SimulationMode },
    { icon: '🔧', title: 'Naming Generator', subtitle: 'AI-powered tool for your prototype', comp: NamingGenerator },
    { icon: '🔧', title: 'Health Monitor', subtitle: 'AI-powered tool for your prototype', comp: HealthMonitor },
    { icon: '🔧', title: 'Green Advisor', subtitle: 'AI-powered tool for your prototype', comp: GreenAdvisor },
    { icon: '🔧', title: 'P C B Footprint Finder', subtitle: 'AI-powered tool for your prototype', comp: PCBFootprintFinder },
    { icon: '🔧', title: 'Connection Diagram', subtitle: 'AI-powered tool for your prototype', comp: ConnectionDiagram },
    { icon: '🔧', title: 'Component Comparison Table', subtitle: 'AI-powered tool for your prototype', comp: ComponentComparisonTable },
    { icon: '🔧', title: 'Power Supply Designer', subtitle: 'AI-powered tool for your prototype', comp: PowerSupplyDesigner },
    { icon: '🔧', title: 'Calibration Tool', subtitle: 'AI-powered tool for your prototype', comp: CalibrationTool },
    { icon: '🔧', title: 'Substitution Finder', subtitle: 'AI-powered tool for your prototype', comp: SubstitutionFinder },
    { icon: '🔧', title: 'Slides Generator', subtitle: 'AI-powered tool for your prototype', comp: SlidesGenerator },
    { icon: '🔧', title: 'P C B Helper', subtitle: 'AI-powered tool for your prototype', comp: PCBHelper },
    { icon: '🔧', title: 'Wiring Guide', subtitle: 'AI-powered tool for your prototype', comp: WiringGuide },
    { icon: '🔧', title: 'Compatibility Checker', subtitle: 'AI-powered tool for your prototype', comp: CompatibilityChecker },
    { icon: '🔧', title: 'Energy Audit', subtitle: 'AI-powered tool for your prototype', comp: EnergyAudit },
    { icon: '🔧', title: 'Simulation Runner', subtitle: 'AI-powered tool for your prototype', comp: SimulationRunner },
    { icon: '🔧', title: 'Spec Sheet Generator', subtitle: 'AI-powered tool for your prototype', comp: SpecSheetGenerator },
    { icon: '🔧', title: 'Documentation Generator', subtitle: 'AI-powered tool for your prototype', comp: DocumentationGenerator },
    { icon: '🔧', title: 'Shopping List Generator', subtitle: 'AI-powered tool for your prototype', comp: ShoppingListGenerator },
    { icon: '🔧', title: 'Name Generator', subtitle: 'AI-powered tool for your prototype', comp: NameGenerator },
    { icon: '🔧', title: 'P C B Planner', subtitle: 'AI-powered tool for your prototype', comp: PCBPlanner },
    { icon: '🔧', title: 'Improvement Suggester', subtitle: 'AI-powered tool for your prototype', comp: ImprovementSuggester },
    { icon: '🔧', title: 'Share Modal', subtitle: 'AI-powered tool for your prototype', comp: ShareModal },
    { icon: '🔧', title: 'A I Chat', subtitle: 'AI-powered tool for your prototype', comp: AIChat },
    { icon: '🔧', title: 'Missing Components', subtitle: 'AI-powered tool for your prototype', comp: MissingComponents },
    { icon: '🔧', title: 'Power Calculator', subtitle: 'AI-powered tool for your prototype', comp: PowerCalculator },
    { icon: '🔧', title: 'Safety Checklist', subtitle: 'AI-powered tool for your prototype', comp: SafetyChecklist },
    { icon: '🔧', title: 'Substitution Suggester', subtitle: 'AI-powered tool for your prototype', comp: SubstitutionSuggester },
    { icon: '🔧', title: 'Enclosure Customizer', subtitle: 'AI-powered tool for your prototype', comp: EnclosureCustomizer },
    { icon: '🔧', title: 'Breadboard View', subtitle: 'AI-powered tool for your prototype', comp: BreadboardView },
    { icon: '🔧', title: 'Pin Assignment Editor', subtitle: 'AI-powered tool for your prototype', comp: PinAssignmentEditor },
    { icon: '🔧', title: 'Component Search', subtitle: 'AI-powered tool for your prototype', comp: ComponentSearch },
    { icon: '🔧', title: 'Component Comparison', subtitle: 'AI-powered tool for your prototype', comp: ComponentComparison },
    { icon: '🔧', title: 'Circuit Diagram', subtitle: 'AI-powered tool for your prototype', comp: CircuitDiagram },
    { icon: '🔧', title: 'Component Detail', subtitle: 'AI-powered tool for your prototype', comp: ComponentDetail },
    { icon: '🔧', title: 'Step Bar', subtitle: 'AI-powered tool for your prototype', comp: StepBar },
  ],
  'code-dev': [
    { icon: '💻', title: 'Hardware Version History', subtitle: 'AI-powered tool for your prototype', comp: HardwareVersionHistory },
    { icon: '💻', title: 'Field Test Planner', subtitle: 'AI-powered tool for your prototype', comp: FieldTestPlanner },
    { icon: '💻', title: 'Hardware Debug Guide', subtitle: 'AI-powered tool for your prototype', comp: HardwareDebugGuide },
    { icon: '💻', title: 'Code Style Guide', subtitle: 'AI-powered tool for your prototype', comp: CodeStyleGuide },
    { icon: '💻', title: 'Error Handling Guide', subtitle: 'AI-powered tool for your prototype', comp: ErrorHandlingGuide },
    { icon: '💻', title: 'A P I Doc Generator', subtitle: 'AI-powered tool for your prototype', comp: APIDocGenerator },
    { icon: '💻', title: 'Dev Environment Setup', subtitle: 'AI-powered tool for your prototype', comp: DevEnvironmentSetup },
    { icon: '💻', title: 'A B Test Planner', subtitle: 'AI-powered tool for your prototype', comp: ABTestPlanner },
    { icon: '💻', title: 'Knowledge Base Builder', subtitle: 'AI-powered tool for your prototype', comp: KnowledgeBaseBuilder },
    { icon: '💻', title: 'Config File Generator', subtitle: 'AI-powered tool for your prototype', comp: ConfigFileGenerator },
    { icon: '💻', title: 'Glossary Builder', subtitle: 'AI-powered tool for your prototype', comp: GlossaryBuilder },
    { icon: '💻', title: 'Changelog Generator', subtitle: 'AI-powered tool for your prototype', comp: ChangelogGenerator },
    { icon: '💻', title: 'Dependency Mapper', subtitle: 'AI-powered tool for your prototype', comp: DependencyMapper },
    { icon: '💻', title: 'Unit Test Generator', subtitle: 'AI-powered tool for your prototype', comp: UnitTestGenerator },
    { icon: '💻', title: 'Security Audit', subtitle: 'AI-powered tool for your prototype', comp: SecurityAudit },
    { icon: '💻', title: 'Code Translator', subtitle: 'AI-powered tool for your prototype', comp: CodeTranslator },
    { icon: '💻', title: 'Error Decoder', subtitle: 'AI-powered tool for your prototype', comp: ErrorDecoder },
    { icon: '💻', title: 'O T A Planner', subtitle: 'AI-powered tool for your prototype', comp: OTAPlanner },
    { icon: '💻', title: 'A P I Planner', subtitle: 'AI-powered tool for your prototype', comp: APIPlanner },
    { icon: '💻', title: 'Datasheet Generator', subtitle: 'AI-powered tool for your prototype', comp: DatasheetGenerator },
    { icon: '💻', title: 'Code Reviewer', subtitle: 'AI-powered tool for your prototype', comp: CodeReviewer },
    { icon: '💻', title: 'Library Finder', subtitle: 'AI-powered tool for your prototype', comp: LibraryFinder },
    { icon: '💻', title: 'Test Suite', subtitle: 'AI-powered tool for your prototype', comp: TestSuite },
    { icon: '💻', title: 'Code Generator2', subtitle: 'AI-powered tool for your prototype', comp: CodeGenerator2 },
    { icon: '💻', title: 'Readme Generator', subtitle: 'AI-powered tool for your prototype', comp: ReadmeGenerator },
    { icon: '💻', title: 'Version History', subtitle: 'AI-powered tool for your prototype', comp: VersionHistory },
    { icon: '💻', title: 'Cost Estimator', subtitle: 'AI-powered tool for your prototype', comp: CostEstimator },
    { icon: '💻', title: 'Code Generator', subtitle: 'AI-powered tool for your prototype', comp: CodeGenerator },
    { icon: '💻', title: 'Datasheet Viewer', subtitle: 'AI-powered tool for your prototype', comp: DatasheetViewer },
  ],
  'testing-qa': [
    { icon: '🧪', title: 'Final Launch Checklist', subtitle: 'AI-powered tool for your prototype', comp: FinalLaunchChecklist },
    { icon: '🧪', title: 'Idea Validation Scorer', subtitle: 'AI-powered tool for your prototype', comp: IdeaValidationScorer },
    { icon: '🧪', title: 'Quality Control Plan', subtitle: 'AI-powered tool for your prototype', comp: QualityControlPlan },
    { icon: '🧪', title: 'T R L Assessment', subtitle: 'AI-powered tool for your prototype', comp: TRLAssessment },
    { icon: '🧪', title: 'Post Launch Planner', subtitle: 'AI-powered tool for your prototype', comp: PostLaunchPlanner },
    { icon: '🧪', title: 'Product Hunt Launch', subtitle: 'AI-powered tool for your prototype', comp: ProductHuntLaunch },
    { icon: '🧪', title: 'M V P Scope Definer', subtitle: 'AI-powered tool for your prototype', comp: MVPScopeDefiner },
    { icon: '🧪', title: 'Accessibility Auditor', subtitle: 'AI-powered tool for your prototype', comp: AccessibilityAuditor },
    { icon: '🧪', title: 'Launch Countdown Planner', subtitle: 'AI-powered tool for your prototype', comp: LaunchCountdownPlanner },
    { icon: '🧪', title: 'Name Validator', subtitle: 'AI-powered tool for your prototype', comp: NameValidator },
    { icon: '🧪', title: 'Sustainability Report', subtitle: 'AI-powered tool for your prototype', comp: SustainabilityReport },
    { icon: '🧪', title: 'Feedback Form Builder', subtitle: 'AI-powered tool for your prototype', comp: FeedbackFormBuilder },
    { icon: '🧪', title: 'Product Checklist', subtitle: 'AI-powered tool for your prototype', comp: ProductChecklist },
    { icon: '🧪', title: 'Compliance Checker', subtitle: 'AI-powered tool for your prototype', comp: ComplianceChecker },
    { icon: '🧪', title: 'Patent Research', subtitle: 'AI-powered tool for your prototype', comp: PatentResearch },
    { icon: '🧪', title: 'Accessibility Checker', subtitle: 'AI-powered tool for your prototype', comp: AccessibilityChecker },
    { icon: '🧪', title: 'Team Collaboration', subtitle: 'AI-powered tool for your prototype', comp: TeamCollaboration },
    { icon: '🧪', title: 'Deployment Checklist', subtitle: 'AI-powered tool for your prototype', comp: DeploymentChecklist },
    { icon: '🧪', title: 'Label Maker', subtitle: 'AI-powered tool for your prototype', comp: LabelMaker },
    { icon: '🧪', title: 'Feedback Collector', subtitle: 'AI-powered tool for your prototype', comp: FeedbackCollector },
    { icon: '🧪', title: 'Launch Readiness', subtitle: 'AI-powered tool for your prototype', comp: LaunchReadiness },
    { icon: '🧪', title: 'Risk Assessment', subtitle: 'AI-powered tool for your prototype', comp: RiskAssessment },
    { icon: '🧪', title: 'Prototype Troubleshooter', subtitle: 'AI-powered tool for your prototype', comp: PrototypeTroubleshooter },
    { icon: '🧪', title: 'Prototype Quiz', subtitle: 'AI-powered tool for your prototype', comp: PrototypeQuiz },
    { icon: '🧪', title: 'Prototype Comparison', subtitle: 'AI-powered tool for your prototype', comp: PrototypeComparison },
    { icon: '🧪', title: 'Prototype Explainer', subtitle: 'AI-powered tool for your prototype', comp: PrototypeExplainer },
    { icon: '🧪', title: 'Prototype Notes', subtitle: 'AI-powered tool for your prototype', comp: PrototypeNotes },
    { icon: '🧪', title: 'Prototype Rating', subtitle: 'AI-powered tool for your prototype', comp: PrototypeRating },
    { icon: '🧪', title: 'Validation Panel', subtitle: 'AI-powered tool for your prototype', comp: ValidationPanel },
    { icon: '🧪', title: 'Change Validator', subtitle: 'AI-powered tool for your prototype', comp: ChangeValidator },
  ],
  'business': [
    { icon: '📈', title: 'Pitch Email Generator', subtitle: 'AI-powered tool for your prototype', comp: PitchEmailGenerator },
    { icon: '📈', title: 'Networking Script Generator', subtitle: 'AI-powered tool for your prototype', comp: NetworkingScriptGenerator },
    { icon: '📈', title: 'Product Story Builder', subtitle: 'AI-powered tool for your prototype', comp: ProductStoryBuilder },
    { icon: '📈', title: 'Revenue Projection', subtitle: 'AI-powered tool for your prototype', comp: RevenueProjection },
    { icon: '📈', title: 'Email Campaign Builder', subtitle: 'AI-powered tool for your prototype', comp: EmailCampaignBuilder },
    { icon: '📈', title: 'Sales Channel Planner', subtitle: 'AI-powered tool for your prototype', comp: SalesChannelPlanner },
    { icon: '📈', title: 'Beta Program Designer', subtitle: 'AI-powered tool for your prototype', comp: BetaProgramDesigner },
    { icon: '📈', title: 'Data Privacy Guide', subtitle: 'AI-powered tool for your prototype', comp: DataPrivacyGuide },
    { icon: '📈', title: 'Investor Update Generator', subtitle: 'AI-powered tool for your prototype', comp: InvestorUpdateGenerator },
    { icon: '📈', title: 'Tech Transfer Package', subtitle: 'AI-powered tool for your prototype', comp: TechTransferPackage },
    { icon: '📈', title: 'Sales Script Generator', subtitle: 'AI-powered tool for your prototype', comp: SalesScriptGenerator },
    { icon: '📈', title: 'Warranty Policy Generator', subtitle: 'AI-powered tool for your prototype', comp: WarrantyPolicyGenerator },
    { icon: '📈', title: 'Community Strategy Builder', subtitle: 'AI-powered tool for your prototype', comp: CommunityStrategyBuilder },
    { icon: '📈', title: 'Investor Q A Prep', subtitle: 'AI-powered tool for your prototype', comp: InvestorQAPrep },
    { icon: '📈', title: 'Partnership Finder', subtitle: 'AI-powered tool for your prototype', comp: PartnershipFinder },
    { icon: '📈', title: 'Localization Planner', subtitle: 'AI-powered tool for your prototype', comp: LocalizationPlanner },
    { icon: '📈', title: 'Pricing Psychology Analyser', subtitle: 'AI-powered tool for your prototype', comp: PricingPsychologyAnalyser },
    { icon: '📈', title: 'Exit Strategy Planner', subtitle: 'AI-powered tool for your prototype', comp: ExitStrategyPlanner },
    { icon: '📈', title: 'Metrics Dashboard Designer', subtitle: 'AI-powered tool for your prototype', comp: MetricsDashboardDesigner },
    { icon: '📈', title: 'Onboarding Flow Builder', subtitle: 'AI-powered tool for your prototype', comp: OnboardingFlowBuilder },
    { icon: '📈', title: 'Press Release Generator', subtitle: 'AI-powered tool for your prototype', comp: PressReleaseGenerator },
    { icon: '📈', title: 'Stakeholder Map', subtitle: 'AI-powered tool for your prototype', comp: StakeholderMap },
    { icon: '📈', title: 'Grant Finder', subtitle: 'AI-powered tool for your prototype', comp: GrantFinder },
    { icon: '📈', title: 'Monetisation Strategist', subtitle: 'AI-powered tool for your prototype', comp: MonetisationStrategist },
    { icon: '📈', title: 'Customer Personas', subtitle: 'AI-powered tool for your prototype', comp: CustomerPersonas },
    { icon: '📈', title: 'Investor Pitch', subtitle: 'AI-powered tool for your prototype', comp: InvestorPitch },
    { icon: '📈', title: 'Crowdfunding Builder', subtitle: 'AI-powered tool for your prototype', comp: CrowdfundingBuilder },
    { icon: '📈', title: 'Pitch Builder', subtitle: 'AI-powered tool for your prototype', comp: PitchBuilder },
    { icon: '📈', title: 'Complexity Analyser', subtitle: 'AI-powered tool for your prototype', comp: ComplexityAnalyser },
  ],
  'planning': [
    { icon: '📋', title: 'Cost Reduction Analyser', subtitle: 'AI-powered tool for your prototype', comp: CostReductionAnalyser },
    { icon: '📋', title: 'Packaging Designer', subtitle: 'AI-powered tool for your prototype', comp: PackagingDesigner },
    { icon: '📋', title: 'Supply Chain Analyser', subtitle: 'AI-powered tool for your prototype', comp: SupplyChainAnalyser },
    { icon: '📋', title: 'User Story Generator', subtitle: 'AI-powered tool for your prototype', comp: UserStoryGenerator },
    { icon: '📋', title: 'Feature Roadmap', subtitle: 'AI-powered tool for your prototype', comp: FeatureRoadmap },
    { icon: '📋', title: 'Sprint Planner', subtitle: 'AI-powered tool for your prototype', comp: SprintPlanner },
    { icon: '📋', title: 'Manufacturing Guide', subtitle: 'AI-powered tool for your prototype', comp: ManufacturingGuide },
    { icon: '📋', title: 'Competition Research', subtitle: 'AI-powered tool for your prototype', comp: CompetitionResearch },
    { icon: '📋', title: 'Inventory Sync', subtitle: 'AI-powered tool for your prototype', comp: InventorySync },
    { icon: '📋', title: 'Cost Tracker', subtitle: 'AI-powered tool for your prototype', comp: CostTracker },
    { icon: '📋', title: 'Hackathon Pack', subtitle: 'AI-powered tool for your prototype', comp: HackathonPack },
    { icon: '📋', title: 'Cost Optimizer', subtitle: 'AI-powered tool for your prototype', comp: CostOptimizer },
    { icon: '📋', title: 'Export Bundle', subtitle: 'AI-powered tool for your prototype', comp: ExportBundle },
    { icon: '📋', title: 'Timeline Planner', subtitle: 'AI-powered tool for your prototype', comp: TimelinePlanner },
    { icon: '📋', title: 'B O M Optimizer', subtitle: 'AI-powered tool for your prototype', comp: BOMOptimizer },
    { icon: '📋', title: 'Stock Checker', subtitle: 'AI-powered tool for your prototype', comp: StockChecker },
    { icon: '📋', title: 'Build Log', subtitle: 'AI-powered tool for your prototype', comp: BuildLog },
    { icon: '📋', title: 'Budget Planner', subtitle: 'AI-powered tool for your prototype', comp: BudgetPlanner },
    { icon: '📋', title: 'Learning Roadmap', subtitle: 'AI-powered tool for your prototype', comp: LearningRoadmap },
    { icon: '📋', title: 'Build Timeline', subtitle: 'AI-powered tool for your prototype', comp: BuildTimeline },
    { icon: '📋', title: 'Model Export Panel', subtitle: 'AI-powered tool for your prototype', comp: ModelExportPanel },
  ],
  'content': [
    { icon: '📢', title: 'Explainer Video Script', subtitle: 'AI-powered tool for your prototype', comp: ExplainerVideoScript },
    { icon: '📢', title: 'Interview Prep Coach', subtitle: 'AI-powered tool for your prototype', comp: InterviewPrepCoach },
    { icon: '📢', title: 'Demo Script Generator', subtitle: 'AI-powered tool for your prototype', comp: DemoScriptGenerator },
    { icon: '📢', title: 'Documentation Writer', subtitle: 'AI-powered tool for your prototype', comp: DocumentationWriter },
    { icon: '📢', title: 'Social Content Generator', subtitle: 'AI-powered tool for your prototype', comp: SocialContentGenerator },
    { icon: '📢', title: 'Word Doc Generator', subtitle: 'AI-powered tool for your prototype', comp: WordDocGenerator },
    { icon: '📢', title: 'Team Report Generator', subtitle: 'AI-powered tool for your prototype', comp: TeamReportGenerator },
    { icon: '📢', title: 'Video Script Generator', subtitle: 'AI-powered tool for your prototype', comp: VideoScriptGenerator },
  ],
  'learn-share': [
    { icon: '🎓', title: 'Io T Dashboard', subtitle: 'AI-powered tool for your prototype', comp: IoTDashboard },
    { icon: '🎓', title: 'Learning Path', subtitle: 'AI-powered tool for your prototype', comp: LearningPath },
    { icon: '🎓', title: 'A I Mentor', subtitle: 'AI-powered tool for your prototype', comp: AIMentor },
    { icon: '🎓', title: 'Challenge Generator', subtitle: 'AI-powered tool for your prototype', comp: ChallengeGenerator },
    { icon: '🎓', title: 'Context Chat', subtitle: 'AI-powered tool for your prototype', comp: ContextChat },
    { icon: '🎓', title: 'Progress Tracker', subtitle: 'AI-powered tool for your prototype', comp: ProgressTracker },
    { icon: '🎓', title: 'Notes Editor', subtitle: 'AI-powered tool for your prototype', comp: NotesEditor },
    { icon: '🎓', title: 'Comment System', subtitle: 'AI-powered tool for your prototype', comp: CommentSystem },
    { icon: '🎓', title: 'Difficulty Panel', subtitle: 'AI-powered tool for your prototype', comp: DifficultyPanel },
  ],
}


const COMP_MAP = {
  'Circuit Simulator': CircuitSimulator,
  'Component Aging Analyser': ComponentAgingAnalyser,
  'Tech Debt Tracker': TechDebtTracker,
  'Rapid Prototype Advisor': RapidPrototypeAdvisor,
  'Noise Emi Analyser': NoiseEmiAnalyser,
  'Architecture Diagram': ArchitectureDiagram,
  'Enclosure Designer': EnclosureDesigner,
  'Parts Substitution Finder': PartsSubstitutionFinder,
  'Wiring Diagram Describer': WiringDiagramDescriber,
  'Protocol Decoder': ProtocolDecoder,
  'Calibration Guide': CalibrationGuide,
  'Sensor Fusion Planner': SensorFusionPlanner,
  'Memory Storage Planner': MemoryStoragePlanner,
  'Wireless Range Calculator': WirelessRangeCalculator,
  'Power Budget': PowerBudget,
  'Signal Integrity Checker': SignalIntegrityChecker,
  'Review Generator': ReviewGenerator,
  'Thermal Management': ThermalManagement,
  'Battery Management': BatteryManagement,
  'Simulation Mode': SimulationMode,
  'Naming Generator': NamingGenerator,
  'Health Monitor': HealthMonitor,
  'Green Advisor': GreenAdvisor,
  'P C B Footprint Finder': PCBFootprintFinder,
  'Connection Diagram': ConnectionDiagram,
  'Component Comparison Table': ComponentComparisonTable,
  'Power Supply Designer': PowerSupplyDesigner,
  'Calibration Tool': CalibrationTool,
  'Substitution Finder': SubstitutionFinder,
  'Slides Generator': SlidesGenerator,
  'P C B Helper': PCBHelper,
  'Wiring Guide': WiringGuide,
  'Compatibility Checker': CompatibilityChecker,
  'Energy Audit': EnergyAudit,
  'Simulation Runner': SimulationRunner,
  'Spec Sheet Generator': SpecSheetGenerator,
  'Documentation Generator': DocumentationGenerator,
  'Shopping List Generator': ShoppingListGenerator,
  'Name Generator': NameGenerator,
  'P C B Planner': PCBPlanner,
  'Improvement Suggester': ImprovementSuggester,
  'Share Modal': ShareModal,
  'A I Chat': AIChat,
  'Missing Components': MissingComponents,
  'Power Calculator': PowerCalculator,
  'Safety Checklist': SafetyChecklist,
  'Substitution Suggester': SubstitutionSuggester,
  'Enclosure Customizer': EnclosureCustomizer,
  'Breadboard View': BreadboardView,
  'Pin Assignment Editor': PinAssignmentEditor,
  'Component Search': ComponentSearch,
  'Component Comparison': ComponentComparison,
  'Circuit Diagram': CircuitDiagram,
  'Component Detail': ComponentDetail,
  'Step Bar': StepBar,
  'Hardware Version History': HardwareVersionHistory,
  'Field Test Planner': FieldTestPlanner,
  'Hardware Debug Guide': HardwareDebugGuide,
  'Code Style Guide': CodeStyleGuide,
  'Error Handling Guide': ErrorHandlingGuide,
  'A P I Doc Generator': APIDocGenerator,
  'Dev Environment Setup': DevEnvironmentSetup,
  'A B Test Planner': ABTestPlanner,
  'Knowledge Base Builder': KnowledgeBaseBuilder,
  'Config File Generator': ConfigFileGenerator,
  'Glossary Builder': GlossaryBuilder,
  'Changelog Generator': ChangelogGenerator,
  'Dependency Mapper': DependencyMapper,
  'Unit Test Generator': UnitTestGenerator,
  'Security Audit': SecurityAudit,
  'Code Translator': CodeTranslator,
  'Error Decoder': ErrorDecoder,
  'O T A Planner': OTAPlanner,
  'A P I Planner': APIPlanner,
  'Datasheet Generator': DatasheetGenerator,
  'Code Reviewer': CodeReviewer,
  'Library Finder': LibraryFinder,
  'Test Suite': TestSuite,
  'Code Generator2': CodeGenerator2,
  'Readme Generator': ReadmeGenerator,
  'Version History': VersionHistory,
  'Cost Estimator': CostEstimator,
  'Code Generator': CodeGenerator,
  'Datasheet Viewer': DatasheetViewer,
  'Final Launch Checklist': FinalLaunchChecklist,
  'Idea Validation Scorer': IdeaValidationScorer,
  'Quality Control Plan': QualityControlPlan,
  'T R L Assessment': TRLAssessment,
  'Post Launch Planner': PostLaunchPlanner,
  'Product Hunt Launch': ProductHuntLaunch,
  'M V P Scope Definer': MVPScopeDefiner,
  'Accessibility Auditor': AccessibilityAuditor,
  'Launch Countdown Planner': LaunchCountdownPlanner,
  'Name Validator': NameValidator,
  'Sustainability Report': SustainabilityReport,
  'Feedback Form Builder': FeedbackFormBuilder,
  'Product Checklist': ProductChecklist,
  'Compliance Checker': ComplianceChecker,
  'Patent Research': PatentResearch,
  'Accessibility Checker': AccessibilityChecker,
  'Team Collaboration': TeamCollaboration,
  'Deployment Checklist': DeploymentChecklist,
  'Label Maker': LabelMaker,
  'Feedback Collector': FeedbackCollector,
  'Launch Readiness': LaunchReadiness,
  'Risk Assessment': RiskAssessment,
  'Prototype Troubleshooter': PrototypeTroubleshooter,
  'Prototype Quiz': PrototypeQuiz,
  'Prototype Comparison': PrototypeComparison,
  'Prototype Explainer': PrototypeExplainer,
  'Prototype Notes': PrototypeNotes,
  'Prototype Rating': PrototypeRating,
  'Validation Panel': ValidationPanel,
  'Change Validator': ChangeValidator,
  'Pitch Email Generator': PitchEmailGenerator,
  'Networking Script Generator': NetworkingScriptGenerator,
  'Product Story Builder': ProductStoryBuilder,
  'Revenue Projection': RevenueProjection,
  'Email Campaign Builder': EmailCampaignBuilder,
  'Sales Channel Planner': SalesChannelPlanner,
  'Beta Program Designer': BetaProgramDesigner,
  'Data Privacy Guide': DataPrivacyGuide,
  'Investor Update Generator': InvestorUpdateGenerator,
  'Tech Transfer Package': TechTransferPackage,
  'Sales Script Generator': SalesScriptGenerator,
  'Warranty Policy Generator': WarrantyPolicyGenerator,
  'Community Strategy Builder': CommunityStrategyBuilder,
  'Investor Q A Prep': InvestorQAPrep,
  'Partnership Finder': PartnershipFinder,
  'Localization Planner': LocalizationPlanner,
  'Pricing Psychology Analyser': PricingPsychologyAnalyser,
  'Exit Strategy Planner': ExitStrategyPlanner,
  'Metrics Dashboard Designer': MetricsDashboardDesigner,
  'Onboarding Flow Builder': OnboardingFlowBuilder,
  'Press Release Generator': PressReleaseGenerator,
  'Stakeholder Map': StakeholderMap,
  'Grant Finder': GrantFinder,
  'Monetisation Strategist': MonetisationStrategist,
  'Customer Personas': CustomerPersonas,
  'Investor Pitch': InvestorPitch,
  'Crowdfunding Builder': CrowdfundingBuilder,
  'Pitch Builder': PitchBuilder,
  'Complexity Analyser': ComplexityAnalyser,
  'Cost Reduction Analyser': CostReductionAnalyser,
  'Packaging Designer': PackagingDesigner,
  'Supply Chain Analyser': SupplyChainAnalyser,
  'User Story Generator': UserStoryGenerator,
  'Feature Roadmap': FeatureRoadmap,
  'Sprint Planner': SprintPlanner,
  'Manufacturing Guide': ManufacturingGuide,
  'Competition Research': CompetitionResearch,
  'Inventory Sync': InventorySync,
  'Cost Tracker': CostTracker,
  'Hackathon Pack': HackathonPack,
  'Cost Optimizer': CostOptimizer,
  'Export Bundle': ExportBundle,
  'Timeline Planner': TimelinePlanner,
  'B O M Optimizer': BOMOptimizer,
  'Stock Checker': StockChecker,
  'Build Log': BuildLog,
  'Budget Planner': BudgetPlanner,
  'Learning Roadmap': LearningRoadmap,
  'Build Timeline': BuildTimeline,
  'Model Export Panel': ModelExportPanel,
  'Explainer Video Script': ExplainerVideoScript,
  'Interview Prep Coach': InterviewPrepCoach,
  'Demo Script Generator': DemoScriptGenerator,
  'Documentation Writer': DocumentationWriter,
  'Social Content Generator': SocialContentGenerator,
  'Word Doc Generator': WordDocGenerator,
  'Team Report Generator': TeamReportGenerator,
  'Video Script Generator': VideoScriptGenerator,
  'Io T Dashboard': IoTDashboard,
  'Learning Path': LearningPath,
  'A I Mentor': AIMentor,
  'Challenge Generator': ChallengeGenerator,
  'Context Chat': ContextChat,
  'Progress Tracker': ProgressTracker,
  'Notes Editor': NotesEditor,
  'Comment System': CommentSystem,
  'Difficulty Panel': DifficultyPanel,
}



// ─── ACCORDION SECTION ────────────────────────────────────────────────────────
function AccordionSection({ icon, title, subtitle, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={"rounded-2xl border-2 overflow-hidden transition-all duration-200 " + (open ? "border-indigo-600 bg-[#080818] shadow-lg shadow-indigo-900/20" : "border-[#1e1e2e] bg-[#0d0d1a] hover:border-[#2e2e4e]")}>
      <button onClick={function() { setOpen(function(o) { return !o }) }}
        className="w-full flex items-center gap-4 p-4 text-left">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base">{title}</p>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-all " + (open ? "bg-indigo-600 text-white" : "bg-[#1e1e2e] text-slate-400")}>
          {open ? "−" : "+"}
        </div>
      </button>
      {open && (
        <div className="border-t border-[#1e1e2e] px-4 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── FEATURE RENDERER ─────────────────────────────────────────────────────────
function FeatureContent({ title, idea, selectedComponents }) {
  const Component = COMP_MAP[title]
  if (!Component) {
    return (
      <div className="text-center py-8 bg-[#080814] rounded-xl border border-[#1e1e2e]">
        <p className="text-3xl mb-2">🤖</p>
        <p className="text-white font-bold mb-1">{title}</p>
        <p className="text-slate-500 text-sm mb-4">Start a project first to use this feature</p>
        <button onClick={function() { window.location.href = '/protospec' }}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition">
          Start with ProtoSpec →
        </button>
      </div>
    )
  }
  return (
    <Component
      idea={idea}
      components={selectedComponents}
      selectedComponents={selectedComponents}
    />
  )
}

// ─── MAIN FEATURES PAGE ───────────────────────────────────────────────────────
function FeaturesPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [idea, setIdea] = useState('')
  const [selectedComponents, setSelectedComponents] = useState([])

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) setIdea(req.idea)
      if (req.components) setSelectedComponents(req.components)
      // Also check viewer state
      const viewerState = localStorage.getItem('protomind_viewer_state')
      if (viewerState) {
        const vs = JSON.parse(viewerState)
        if (vs.idea && !req.idea) setIdea(vs.idea)
        if (vs.selectedComponents && !req.components) setSelectedComponents(vs.selectedComponents)
      }
    } catch(e) {}
  }, [])

  const cat = CATEGORY_META[categoryId]
  if (!cat) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-2xl font-bold mb-2">Category not found</p>
          <p className="text-slate-400 mb-6">"{categoryId}" is not a valid category</p>
          <button onClick={function(){navigate('/viewer')}}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition">
            ← Back to ProtoView
          </button>
        </div>
      </div>
    )
  }

  const allFeatures = CATEGORY_FEATURES[categoryId] || []
  const filtered = search.trim()
    ? allFeatures.filter(function(f) {
        const q = search.toLowerCase()
        return f.title.toLowerCase().includes(q) || f.subtitle.toLowerCase().includes(q)
      })
    : allFeatures

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#050510] bg-opacity-95 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={function(){navigate('/viewer')}}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white transition text-sm px-3 py-1.5 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg">
              ← ProtoView
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.icon}</span>
              <span className="text-white font-black text-lg">{cat.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                style={{backgroundColor: cat.color + '20', color: cat.color}}>
                {filtered.length} / {allFeatures.length} tools
              </span>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input value={search} onChange={function(e){setSearch(e.target.value)}}
              placeholder={"Search " + cat.name + " features..."}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl pl-9 pr-4 py-2 text-white text-sm outline-none focus:border-indigo-500"/>
            {search && (
              <button onClick={function(){setSearch('')}}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero card */}
        <div className="rounded-2xl border p-6 mb-6"
          style={{backgroundColor: cat.color + '08', borderColor: cat.color + '30'}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{backgroundColor: cat.color + '20'}}>
              {cat.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{cat.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{cat.desc}</p>
              {idea && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
                  <span className="text-slate-500 text-xs">Project: {idea.slice(0, 50)}{idea.length > 50 ? '...' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-bold text-lg mb-2">No results for "{search}"</p>
            <button onClick={function(){setSearch('')}}
              className="text-indigo-400 hover:underline text-sm">Clear search</button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(function(feature, i) {
              return (
                <AccordionSection key={i} icon={feature.icon} title={feature.title} subtitle={feature.subtitle}>
                  <FeatureContent
                    title={feature.title}
                    idea={idea}
                    selectedComponents={selectedComponents}
                  />
                </AccordionSection>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FeaturesPage

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
  ],
  'code-dev': [
  ],
  'testing-qa': [
  ],
  'business': [
  ],
  'planning': [
  ],
  'content': [
  ],
  'learn-share': [
  ],
}

const COMP_MAP = {
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

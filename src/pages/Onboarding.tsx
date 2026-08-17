import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, Target, Check } from "lucide-react";

const steps = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Target Services", icon: Target },
  { id: 3, label: "Preferences", icon: Globe },
];

const services = [
  "AI Agents",
  "LLMs",
  "RAG",
  "AI Automation",
  "Machine Learning",
  "Chatbot Development",
  "Computer Vision",
  "NLP",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-Commerce",
  "Manufacturing",
  "Real Estate",
  "Marketing",
  "Other",
];

const geographies = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa",
  "Global",
];

const clientTypes = ["Startup", "SMB", "Enterprise"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [geography, setGeography] = useState("");
  const [clientType, setClientType] = useState("");
  const [keywords, setKeywords] = useState("");

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const complete = () => {
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              Lead<span className="text-blue-500">Gen</span> AI
            </h1>
            <p className="text-gray-400 mt-2">Let's set up your account</p>
          </div>

          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-blue-500 border-blue-500"
                        : isActive
                          ? "bg-blue-500/20 border-blue-500"
                          : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-gray-500"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive || isCompleted ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="input-field w-full pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="input-field w-full pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select your industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <p className="text-gray-400 text-sm">
                Select the services you want to target for lead generation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Target Geography
                </label>
                <select
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select a region</option>
                  {geographies.map((geo) => (
                    <option key={geo} value={geo}>
                      {geo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Ideal Client Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {clientTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClientType(type)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        clientType === type
                          ? "bg-blue-500/10 border-blue-500 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Target Keywords
                </label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="AI consulting, machine learning solutions, chatbot development..."
                  rows={4}
                  className="input-field w-full resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter keywords separated by commas
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button onClick={back} className="btn-secondary px-6">
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button onClick={next} className="btn-primary px-6">
                Next
              </button>
            ) : (
              <button onClick={complete} className="btn-primary px-6">
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

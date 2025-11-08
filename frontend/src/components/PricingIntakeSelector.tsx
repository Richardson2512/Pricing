import React from 'react';
import { FileText, Edit3, ArrowRight, Upload, CheckCircle } from 'lucide-react';

type IntakeMethod = 'manual' | 'document';

interface PricingIntakeSelectorProps {
  onSelect: (method: IntakeMethod) => void;
}

export function PricingIntakeSelector({ onSelect }: PricingIntakeSelectorProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          How would you like to get your pricing?
        </h1>
        <p className="text-xl text-slate-600">
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Manual Questionnaire Option */}
        <div
          onClick={() => onSelect('manual')}
          className="bg-white rounded-2xl p-8 border-2 border-beige-200 hover:border-olive-500 hover:shadow-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="bg-olive-100 p-4 rounded-xl group-hover:bg-olive-600 transition">
              <Edit3 className="w-8 h-8 text-olive-600 group-hover:text-white transition" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-olive-600 transition" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Fill Out Questionnaire
          </h2>
          <p className="text-slate-600 mb-6">
            Answer a few simple questions about your product or service, and we'll analyze the market to give you the perfect price.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Quick and easy - takes 3-5 minutes</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Guided questions for accuracy</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Perfect for new products or services</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-beige-200">
            <p className="text-sm font-semibold text-olive-600 group-hover:text-olive-700">
              Best for: Freelancers, Startups, New Products
            </p>
          </div>
        </div>

        {/* Document Upload Option */}
        <div
          onClick={() => onSelect('document')}
          className="bg-white rounded-2xl p-8 border-2 border-beige-200 hover:border-olive-500 hover:shadow-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="bg-olive-100 p-4 rounded-xl group-hover:bg-olive-600 transition">
              <Upload className="w-8 h-8 text-olive-600 group-hover:text-white transition" />
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-olive-600 transition" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Upload Documents
          </h2>
          <p className="text-slate-600 mb-6">
            Upload your business documents (SoW, contracts, quotations, etc.) and our AI will automatically extract all the details.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Automated data extraction</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Supports PDF, DOCX, TXT, CSV</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">AI-powered intelligent parsing</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-beige-200">
            <p className="text-sm font-semibold text-olive-600 group-hover:text-olive-700">
              Best for: Existing Projects, RFPs, Quotations
            </p>
          </div>
        </div>
      </div>

      {/* Supported Document Types */}
      <div className="mt-12 bg-beige-50 rounded-xl p-6 border border-beige-200">
        <div className="flex items-start gap-4">
          <FileText className="w-6 h-6 text-olive-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Supported Document Types
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Our AI can extract pricing information from:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-sm text-slate-700">• Statement of Work (SoW)</div>
              <div className="text-sm text-slate-700">• Contracts</div>
              <div className="text-sm text-slate-700">• Quotations</div>
              <div className="text-sm text-slate-700">• Purchase Orders</div>
              <div className="text-sm text-slate-700">• Project Proposals</div>
              <div className="text-sm text-slate-700">• RFPs</div>
              <div className="text-sm text-slate-700">• Invoices</div>
              <div className="text-sm text-slate-700">• Book Orders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


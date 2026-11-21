'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Building2, Settings, Shield, Recycle, Boxes, Plus, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export function SettingsView() {
  const { recyclingOutputTypes, addRecyclingOutputType } = useERP();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PRODUCTS' | 'RECYCLING' | 'ROLES'>('PROFILE');

  const [isAddOutputOpen, setIsAddOutputOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');

  const handleAddOutputType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    addRecyclingOutputType(newTypeName.trim(), newTypeDesc.trim() || 'Custom factory output');
    setNewTypeName('');
    setNewTypeDesc('');
    setIsAddOutputOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Factory Settings & Master Data</h2>
          <p className="text-xs text-[#64748B]">
            Configure company identity, product catalogue, configurable recycling outputs, and role permissions
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {[
            { id: 'PROFILE', label: 'Company Profile' },
            { id: 'PRODUCTS', label: 'Products & Variants' },
            { id: 'RECYCLING', label: 'Recycling Outputs Master' },
            { id: 'ROLES', label: 'User Roles & RBAC' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 space-y-6 max-w-3xl text-xs">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-14 h-14 rounded-xl bg-[#142238] text-white flex items-center justify-center font-bold text-2xl shadow">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">BagFactory ERP (Industrial Unit 1)</h3>
              <p className="text-xs text-slate-500">Shopping Bag Extrusion, Recycling & Wholesale Manufacturing</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                readOnly
                value="BagFactory Manufacturing (Pvt) Ltd."
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Operating Currency</label>
              <input
                type="text"
                readOnly
                value="PKR (Pakistani Rupee - Rs.)"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Weight & Sales Unit</label>
              <input
                type="text"
                readOnly
                value="Kilograms (kg)"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tax Registration NTN</label>
              <input
                type="text"
                readOnly
                value="8192049-2 (FBR Registered Active Taxpayer)"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Factory Location & Industrial Estate</label>
            <input
              type="text"
              readOnly
              value="Plot 48, Sector 15, Korangi Industrial Area / Gujranwala Industrial Zone"
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Products & Variants Master */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Standard Product Lines & Specifications</h3>
            <p className="text-xs text-slate-500">Manufactured shopping bags with thickness, grade, and colors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ABHA Product Family */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-950">ABHA Product Line (Carrier Bags)</h4>
                <Badge variant="recycled">Primary Source: Recycled Raw Material</Badge>
              </div>
              <p className="text-xs text-slate-600">
                Cost-effective everyday retail carrier bags manufactured using 100% recycled polymer pellets.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="font-semibold">ABHA White:</span>
                  <span>20–25 Micron • Standard shopping bag</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="font-semibold">ABHA Black:</span>
                  <span>25–30 Micron • Heavy duty retail bag</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold">Primary Sales Unit:</span>
                  <span className="font-bold text-slate-900">Sold by Kilogram (kg)</span>
                </div>
              </div>
            </div>

            {/* Crystal Product Family */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-blue-950">Crystal Product Line (High-Clarity)</h4>
                <Badge variant="new">Primary Source: New Virgin Polymer</Badge>
              </div>
              <p className="text-xs text-slate-600">
                High-tensile strength, ultra-clear transparent bags manufactured using 100% virgin imported resin.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="font-semibold">Crystal White Clear:</span>
                  <span>30 Micron • Medical & boutique bags</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="font-semibold">Crystal Black Extra-Heavy:</span>
                  <span>35 Micron • Industrial heavy packaging</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold">Primary Sales Unit:</span>
                  <span className="font-bold text-slate-900">Sold by Kilogram (kg)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Configurable Recycling Output Materials Master */}
      {activeTab === 'RECYCLING' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configurable Recycling Output Types</h3>
              <p className="text-xs text-slate-500">
                Requirement #7 & A4 compliant: Dynamic material types created by the internal recycling process
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddOutputOpen(true)}
            >
              Add Output Type
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recyclingOutputTypes.map((type) => (
              <div key={type.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-purple-950">{type.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                    {type.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{type.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-purple-100 text-[11px] text-slate-500">
                  <span>Unit: {type.defaultUnit}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active in Recycling Module
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Output Type Modal */}
          <Modal
            isOpen={isAddOutputOpen}
            onClose={() => setIsAddOutputOpen(false)}
            title="Add Recycling Output Material Type"
            subtitle="Configure a new output product type for the recycling lines"
            maxWidth="md"
          >
            <form onSubmit={handleAddOutputType} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Material Output Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Densified Agglomerate Grade-B, Extruded Pellets..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description & Grade Specs</label>
                <textarea
                  rows={3}
                  placeholder="Specify intended extrusion use, density, or melt index..."
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="outline" type="button" onClick={() => setIsAddOutputOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Material Type
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 4: User Roles & RBAC */}
      {activeTab === 'ROLES' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-500">Module and operational permissions enforced across user accounts</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Module / Capability</th>
                  <th className="py-2.5 px-3 text-center">Owner / Admin</th>
                  <th className="py-2.5 px-3 text-center">Accountant</th>
                  <th className="py-2.5 px-3 text-center">Production Mgr</th>
                  <th className="py-2.5 px-3 text-center">Inventory Mgr</th>
                  <th className="py-2.5 px-3 text-center">Sales Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { module: 'Executive Dashboard & Financial KPIs', roles: [true, true, false, false, false] },
                  { module: 'Inventory: Add, Transfer & Adjust Stock', roles: [true, true, true, true, false] },
                  { module: 'Production Batches (ABHA / Crystal)', roles: [true, false, true, false, false] },
                  { module: 'Recycling Batches (Waste to Recycled)', roles: [true, false, true, false, false] },
                  { module: 'Sales Invoices & Customer Khata', roles: [true, true, false, false, true] },
                  { module: 'Purchases & Supplier Payables', roles: [true, true, false, true, false] },
                  { module: 'Expenses, Salaries & Loans', roles: [true, true, false, false, false] },
                  { module: 'P&L, Balance Sheet & Audits', roles: [true, true, false, false, false] },
                  { module: 'Master Data & System Settings', roles: [true, false, false, false, false] },
                ].map((row) => (
                  <tr key={row.module} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.module}</td>
                    {row.roles.map((hasAccess, idx) => (
                      <td key={idx} className="py-2.5 px-3 text-center">
                        {hasAccess ? (
                          <span className="text-emerald-600 font-bold">✓ Full Access</span>
                        ) : (
                          <span className="text-slate-300">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

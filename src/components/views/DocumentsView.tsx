'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { FactoryDocument } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FileText, Plus, Download, Eye, Paperclip, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export function DocumentsView() {
  const { documents, searchQuery } = useERP();
  const [selectedDoc, setSelectedDoc] = useState<FactoryDocument | null>(null);

  const filteredDocs = documents.filter((d) => {
    return (
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.linkedEntity.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Factory Documents & Bill Attachments</h2>
          <p className="text-xs text-[#64748B]">
            Commercial supplier bills, signed delivery challans, weighbridge tickets, and utility slips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Archived Documents"
          value={documents.length}
          subtitle="Linked to live ERP transactions"
          icon={FileText}
          highlightColor="blue"
        />
        <KPICard
          title="Purchase & Weighbridge Slips"
          value={documents.filter((d) => d.category === 'Purchase Bill').length}
          subtitle="Supplier bill evidence"
          icon={Paperclip}
          highlightColor="navy"
        />
        <KPICard
          title="Signed Delivery Challans"
          value={documents.filter((d) => d.category === 'Delivery Challan').length}
          subtitle="Signed customer receipts"
          icon={CheckCircle2}
          highlightColor="green"
        />
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-3">File Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Linked ERP Transaction</th>
                <th className="py-3 px-3">Uploaded Date</th>
                <th className="py-3 px-3">Uploaded By</th>
                <th className="py-3 px-3 text-right">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{doc.title}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{doc.fileName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-700">{doc.linkedEntity}</td>
                  <td className="py-3 px-3 text-slate-500">{doc.uploadDate}</td>
                  <td className="py-3 px-3 text-slate-700">{doc.uploadedBy}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-500">{doc.fileSize}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      <Modal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || 'Document Preview'}
        subtitle={`Attached to ${selectedDoc?.linkedEntity} • File: ${selectedDoc?.fileName}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center space-y-2">
            <FileText className="w-12 h-12 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-900">{selectedDoc?.fileName}</h4>
            <p className="text-slate-500 text-xs">
              File size: {selectedDoc?.fileSize} • Uploaded by {selectedDoc?.uploadedBy} on {selectedDoc?.uploadDate}
            </p>
            <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-2 font-medium">
              Verified Attachment Linked to Record: {selectedDoc?.linkedEntity}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedDoc(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => alert(`Downloading ${selectedDoc?.fileName}...`)}
            >
              Download Original File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

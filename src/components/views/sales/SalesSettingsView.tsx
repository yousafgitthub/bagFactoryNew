'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesPageShell } from './SalesPageShell';
import { Button } from '../../common/Button';

export function SalesSettingsView() {
  const { salesSettings, updateSalesSettings } = useERP();
  const [form, setForm] = useState(salesSettings);

  return (
    <SalesPageShell title="Sales Settings" subtitle="Tax disabled by default • PKR • kg • invoice numbering">
      <div className="bg-white border rounded-xl p-4 grid sm:grid-cols-2 gap-4 text-xs max-w-3xl">
        <label className="block">
          Invoice prefix
          <input className="w-full mt-1 border rounded-lg p-2" value={form.invoiceNumberPrefix} onChange={(e) => setForm({ ...form, invoiceNumberPrefix: e.target.value })} />
        </label>
        <label className="block">
          Next sequence
          <input type="number" className="w-full mt-1 border rounded-lg p-2" value={form.invoiceNumberNextSeq} onChange={(e) => setForm({ ...form, invoiceNumberNextSeq: Number(e.target.value) })} />
        </label>
        <label className="block">
          Default payment terms (days)
          <input type="number" className="w-full mt-1 border rounded-lg p-2" value={form.defaultPaymentTermsDays} onChange={(e) => setForm({ ...form, defaultPaymentTermsDays: Number(e.target.value) })} />
        </label>
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={form.taxEnabled} onChange={(e) => setForm({ ...form, taxEnabled: e.target.checked })} />
          Enable tax (off by default)
        </label>
        {form.taxEnabled && (
          <label className="block">
            Tax rate %
            <input type="number" className="w-full mt-1 border rounded-lg p-2" value={form.taxRatePct} onChange={(e) => setForm({ ...form, taxRatePct: Number(e.target.value) })} />
          </label>
        )}
        <label className="block sm:col-span-2">
          Factory name
          <input className="w-full mt-1 border rounded-lg p-2" value={form.factoryName} onChange={(e) => setForm({ ...form, factoryName: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          Invoice footer
          <textarea className="w-full mt-1 border rounded-lg p-2" rows={2} value={form.invoiceFooter} onChange={(e) => setForm({ ...form, invoiceFooter: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          Return policy
          <textarea className="w-full mt-1 border rounded-lg p-2" rows={2} value={form.returnPolicyNote} onChange={(e) => setForm({ ...form, returnPolicyNote: e.target.value })} />
        </label>
        <div className="sm:col-span-2">
          <Button size="sm" onClick={() => updateSalesSettings(form)}>
            Save settings
          </Button>
        </div>
      </div>
    </SalesPageShell>
  );
}
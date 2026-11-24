'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { Button } from '../../common/Button';

export function PurchasingSettingsView() {
  const { purchaseSettings, updatePurchaseSettings } = useERP();
  const [settings, setSettings] = useState(purchaseSettings);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updatePurchaseSettings(settings);
  };

  return (
    <PurchasingPageShell title="Purchase Settings" subtitle="Prefixes, PKR defaults, payment methods — tax disabled unless enabled">
      <form onSubmit={save} className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-3 text-xs max-w-2xl">
        <Field label="Purchase # prefix" value={settings.purchaseNumberPrefix} onChange={(v) => setSettings({ ...settings, purchaseNumberPrefix: v })} />
        <Field label="Next purchase seq" type="number" value={String(settings.purchaseNumberNextSeq)} onChange={(v) => setSettings({ ...settings, purchaseNumberNextSeq: Number(v) })} />
        <Field label="Supplier code prefix" value={settings.supplierCodePrefix} onChange={(v) => setSettings({ ...settings, supplierCodePrefix: v })} />
        <Field label="GRN prefix" value={settings.receiptNumberPrefix} onChange={(v) => setSettings({ ...settings, receiptNumberPrefix: v })} />
        <Field label="Return prefix" value={settings.returnNumberPrefix} onChange={(v) => setSettings({ ...settings, returnNumberPrefix: v })} />
        <Field label="Default payment terms (days)" type="number" value={String(settings.defaultPaymentTermsDays)} onChange={(v) => setSettings({ ...settings, defaultPaymentTermsDays: Number(v) })} />
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" checked={settings.taxEnabled} onChange={(e) => setSettings({ ...settings, taxEnabled: e.target.checked, taxRatePct: e.target.checked ? settings.taxRatePct : 0 })} />
          Enable tax on purchases (off by default — no FBR integration)
        </label>
        {settings.taxEnabled ? (
          <Field label="Tax rate %" type="number" value={String(settings.taxRatePct)} onChange={(v) => setSettings({ ...settings, taxRatePct: Number(v) })} />
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" variant="primary">Save settings</Button>
        </div>
      </form>
    </PurchasingPageShell>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700">{label}</span>
      <input type={type} className="w-full mt-1 border rounded-lg p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  IndianRupee,
  Save,
  Edit2,
  CheckCircle2,
  Tag,
  X,
} from 'lucide-react';

interface PricingTier {
  id: string;
  venueType: string;
  size: string;
  initialHours: number;
  initialRate: number;
  excessHourlyRate: number;
  maxDailyCap: number;
  status: 'ACTIVE' | 'DRAFT';
}

const initialTiers: PricingTier[] = [
  { id: 'PRC-01', venueType: 'Mall', size: 'SMALL', initialHours: 2, initialRate: 50, excessHourlyRate: 25, maxDailyCap: 250, status: 'ACTIVE' },
  { id: 'PRC-02', venueType: 'Mall', size: 'MEDIUM', initialHours: 2, initialRate: 80, excessHourlyRate: 40, maxDailyCap: 400, status: 'ACTIVE' },
  { id: 'PRC-03', venueType: 'Mall', size: 'LARGE', initialHours: 2, initialRate: 120, excessHourlyRate: 60, maxDailyCap: 600, status: 'ACTIVE' },
  { id: 'PRC-04', venueType: 'Mall', size: 'XL', initialHours: 2, initialRate: 180, excessHourlyRate: 90, maxDailyCap: 900, status: 'ACTIVE' },
  { id: 'PRC-05', venueType: 'Metro', size: 'SMALL', initialHours: 1, initialRate: 30, excessHourlyRate: 20, maxDailyCap: 200, status: 'ACTIVE' },
  { id: 'PRC-06', venueType: 'Metro', size: 'MEDIUM', initialHours: 1, initialRate: 50, excessHourlyRate: 30, maxDailyCap: 300, status: 'ACTIVE' },
  { id: 'PRC-07', venueType: 'Metro', size: 'LARGE', initialHours: 1, initialRate: 80, excessHourlyRate: 50, maxDailyCap: 500, status: 'ACTIVE' },
  { id: 'PRC-08', venueType: 'Railway', size: 'LARGE', initialHours: 3, initialRate: 100, excessHourlyRate: 35, maxDailyCap: 350, status: 'ACTIVE' },
  { id: 'PRC-09', venueType: 'Railway', size: 'XL', initialHours: 3, initialRate: 150, excessHourlyRate: 50, maxDailyCap: 500, status: 'ACTIVE' },
  { id: 'PRC-10', venueType: 'Airport', size: 'LARGE', initialHours: 4, initialRate: 300, excessHourlyRate: 100, maxDailyCap: 1200, status: 'ACTIVE' },
  { id: 'PRC-11', venueType: 'Airport', size: 'XL', initialHours: 4, initialRate: 450, excessHourlyRate: 150, maxDailyCap: 1800, status: 'ACTIVE' },
  { id: 'PRC-12', venueType: 'Campus', size: '2 PHONE', initialHours: 1, initialRate: 20, excessHourlyRate: 10, maxDailyCap: 100, status: 'ACTIVE' },
];

export const PricingControl: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>(initialTiers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingTier>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const startEdit = (tier: PricingTier) => {
    setEditingId(tier.id);
    setEditForm({ ...tier });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setTiers(prev => prev.map(t => t.id === editingId ? { ...t, ...editForm } as PricingTier : t));
    setEditingId(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Dynamic Pricing & Rate Matrix</h1>
            <Badge variant="outline" size="sm" className="font-mono">
              EDGE CONFIG
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Configure venue-specific base rates, excess hour penalties, and 24-hr daily maximum caps.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>Pricing rules successfully updated and synchronized to edge IoT terminals!</span>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">Active Tariff Schemes ({tiers.length})</CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Live rate rules deployed across kiosks
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule ID</TableHead>
                <TableHead>Venue Type</TableHead>
                <TableHead>Locker Size</TableHead>
                <TableHead>Base Window</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Excess / Hour</TableHead>
                <TableHead>Max Daily Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map(t => {
                const isEditing = editingId === t.id;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-bold text-ink">{t.id}</TableCell>
                    <TableCell className="font-semibold text-ink">{t.venueType}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="sm">
                        {t.size}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.initialHours || 0}
                          onChange={e => setEditForm(p => ({ ...p, initialHours: Number(e.target.value) }))}
                          className="w-20 h-8 text-xs font-mono font-bold"
                        />
                      ) : (
                        `${t.initialHours} Hours`
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-ink font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.initialRate || 0}
                          onChange={e => setEditForm(p => ({ ...p, initialRate: Number(e.target.value) }))}
                          className="w-20 h-8 text-xs font-mono font-bold text-primary"
                        />
                      ) : (
                        `₹${t.initialRate}`
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-ink-muted">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.excessHourlyRate || 0}
                          onChange={e => setEditForm(p => ({ ...p, excessHourlyRate: Number(e.target.value) }))}
                          className="w-20 h-8 text-xs font-mono font-bold"
                        />
                      ) : (
                        `₹${t.excessHourlyRate} / hr`
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.maxDailyCap || 0}
                          onChange={e => setEditForm(p => ({ ...p, maxDailyCap: Number(e.target.value) }))}
                          className="w-20 h-8 text-xs font-mono font-bold text-emerald-600"
                        />
                      ) : (
                        `₹${t.maxDailyCap}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'ACTIVE' ? 'success' : 'secondary'} size="sm">
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={saveEdit}
                            className="h-7 px-2.5 text-xs font-bold"
                          >
                            <Save className="size-3" />
                            <span>Save</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(t)}
                          className="text-ink-muted hover:text-primary"
                          title="Edit Tariff"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

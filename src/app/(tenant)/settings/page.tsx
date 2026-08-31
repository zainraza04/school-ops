'use client';

import { useState, type ReactNode } from 'react';
import { ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { ACADEMIC_SESSIONS } from '@/lib/constants';
import { MOCK_SCHOOLS } from '@/lib/mockData';

const SCHOOL = MOCK_SCHOOLS[0];

export default function SettingsPage(): ReactNode {
  const { can } = usePermissions();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: SCHOOL.name,
    address: SCHOOL.address,
    phone: SCHOOL.phone,
    email: SCHOOL.email,
    website: SCHOOL.website,
  });

  const [sessionId, setSessionId] = useState<string>(
    ACADEMIC_SESSIONS.find((s) => s.status === 'active')?.id ?? ACADEMIC_SESSIONS[0].id
  );

  const [feeSettings, setFeeSettings] = useState({
    dueDay: '10',
    lateFee: '200',
    receiptPrefix: 'REC',
    showSchoolLogo: true,
  });

  const [whatsapp, setWhatsapp] = useState({
    enabled: true,
    apiKey: '',
    senderNumber: '0300-1112233',
    provider: 'meta',
  });

  if (!can('settings', 'manage')) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          subtitle="School profile and configuration"
          breadcrumb={['Settings']}
        />
        <EmptyState
          icon={ShieldOff}
          title="Permission denied"
          description="Only the school owner can manage settings. Contact your owner if you need access."
        />
      </div>
    );
  }

  async function handleSave(section: string): Promise<void> {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success(`${section} saved successfully`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage school profile, sessions, fees, and WhatsApp"
        breadcrumb={['Settings']}
      />

      <Tabs defaultValue="profile" orientation="vertical" className="gap-6 lg:flex-row">
        <TabsList
          variant="line"
          className="h-auto w-full shrink-0 justify-start lg:w-52 lg:flex-col"
        >
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="session">Academic Session</TabsTrigger>
          <TabsTrigger value="fees">Fee Settings</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Integration</TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>School Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-address">Address</Label>
                  <Input
                    id="school-address"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="school-phone">Phone</Label>
                    <Input
                      id="school-phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-email">Email</Label>
                    <Input
                      id="school-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-website">Website</Label>
                  <Input
                    id="school-website"
                    value={profile.website}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="https://"
                  />
                </div>
                <Button
                  disabled={saving}
                  onClick={() => void handleSave('School profile')}
                >
                  {saving ? 'Saving…' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session" className="mt-0">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>Academic Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="active-session">Default / Active Session</Label>
                  <AppSelect
                    id="active-session"
                    value={sessionId}
                    onValueChange={setSessionId}
                    placeholder="Select session"
                    aria-label="Active session"
                    triggerClassName="max-w-sm"
                    options={ACADEMIC_SESSIONS.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.status})`,
                    }))}
                  />
                </div>
                <ul className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                  {ACADEMIC_SESSIONS.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.startDate} → {s.endDate}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={saving}
                  onClick={() => void handleSave('Academic session')}
                >
                  {saving ? 'Saving…' : 'Save Session'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="mt-0">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>Fee Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="due-day">Fee Due Day (of month)</Label>
                    <Input
                      id="due-day"
                      type="number"
                      min={1}
                      max={28}
                      value={feeSettings.dueDay}
                      onChange={(e) =>
                        setFeeSettings((f) => ({ ...f, dueDay: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late-fee">Late Fee (PKR)</Label>
                    <Input
                      id="late-fee"
                      type="number"
                      min={0}
                      value={feeSettings.lateFee}
                      onChange={(e) =>
                        setFeeSettings((f) => ({ ...f, lateFee: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt-prefix">Receipt Number Prefix</Label>
                  <Input
                    id="receipt-prefix"
                    value={feeSettings.receiptPrefix}
                    onChange={(e) =>
                      setFeeSettings((f) => ({
                        ...f,
                        receiptPrefix: e.target.value,
                      }))
                    }
                    placeholder="REC"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: #{feeSettings.receiptPrefix || 'REC'}-000421
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={feeSettings.showSchoolLogo}
                    onChange={(e) =>
                      setFeeSettings((f) => ({
                        ...f,
                        showSchoolLogo: e.target.checked,
                      }))
                    }
                    className="size-4 rounded border"
                    aria-label="Show school logo on receipts"
                  />
                  Show school logo on receipts
                </label>
                <Button
                  disabled={saving}
                  onClick={() => void handleSave('Fee settings')}
                >
                  {saving ? 'Saving…' : 'Save Fee Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>WhatsApp Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={whatsapp.enabled}
                    onChange={(e) =>
                      setWhatsapp((w) => ({ ...w, enabled: e.target.checked }))
                    }
                    className="size-4 rounded border"
                    aria-label="Enable WhatsApp notifications"
                  />
                  Enable WhatsApp notifications
                </label>
                <div className="space-y-2">
                  <Label htmlFor="wa-provider">Provider</Label>
                  <AppSelect
                    id="wa-provider"
                    value={whatsapp.provider}
                    onValueChange={(v) =>
                      setWhatsapp((w) => ({ ...w, provider: v }))
                    }
                    placeholder="Select provider"
                    aria-label="WhatsApp provider"
                    triggerClassName="max-w-sm"
                    options={[
                      { value: 'meta', label: 'Meta Cloud API' },
                      { value: 'twilio', label: 'Twilio' },
                      { value: 'custom', label: 'Custom Gateway' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-sender">Sender Number (+92)</Label>
                  <Input
                    id="wa-sender"
                    value={whatsapp.senderNumber}
                    onChange={(e) =>
                      setWhatsapp((w) => ({
                        ...w,
                        senderNumber: e.target.value,
                      }))
                    }
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-key">API Key</Label>
                  <Input
                    id="wa-key"
                    type="password"
                    value={whatsapp.apiKey}
                    onChange={(e) =>
                      setWhatsapp((w) => ({ ...w, apiKey: e.target.value }))
                    }
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                </div>
                <Button
                  disabled={saving}
                  onClick={() => void handleSave('WhatsApp settings')}
                >
                  {saving ? 'Saving…' : 'Save WhatsApp Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useSite, usePricing, useCafe } from '@/hooks/useContent';
import { saveSettings } from '@/lib/contentAdmin';
import { db } from '@/lib/firebase';
import PremiumButton from '@/components/ui/PremiumButton';
import ImageField from './ImageField';

const Text = ({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</label>
    {textarea ? (
      <textarea
        rows={3}
        className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors resize-y"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

const Num = ({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</label>
    <input
      type="number"
      step={step}
      className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const SaveBar = ({ onSave, saving }: { onSave: () => void; saving: boolean }) => (
  <div className="pt-2">
    <PremiumButton onClick={onSave} disabled={saving}>
      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save changes'}
    </PremiumButton>
  </div>
);

// ---- Site ----
export const SiteEditor = () => {
  const { data } = useSite();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data && !form) setForm({ ...data }); }, [data, form]);
  if (!form) return <Loading />;
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p!, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await saveSettings('site', form); qc.invalidateQueries({ queryKey: ['site'] }); toast.success('Saved'); }
    catch { toast.error('Save failed.'); } finally { setSaving(false); }
  };
  const s = (k: string) => (form[k] as string) ?? '';
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Site Info</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Text label="Name" value={s('name')} onChange={(v) => set('name', v)} />
        <Text label="Tagline" value={s('tagline')} onChange={(v) => set('tagline', v)} />
        <Text label="Phone (display)" value={s('phone')} onChange={(v) => set('phone', v)} />
        <Text label="Phone (E.164, e.g. +9170...)" value={s('phoneE164')} onChange={(v) => set('phoneE164', v)} />
        <Text label="Email" value={s('email')} onChange={(v) => set('email', v)} />
        <Text label="Hours" value={s('hours')} onChange={(v) => set('hours', v)} />
        <Text label="Instagram URL" value={s('instagram')} onChange={(v) => set('instagram', v)} />
        <Text label="Website" value={s('website')} onChange={(v) => set('website', v)} />
        <Num label="Weight limit (kg)" value={(form.weightLimitKg as number) ?? 0} onChange={(v) => set('weightLimitKg', v)} />
        <Text label="Razorpay link" value={s('razorpayLink')} onChange={(v) => set('razorpayLink', v)} />
      </div>
      <Text label="Address" value={s('address')} onChange={(v) => set('address', v)} textarea />
      <Text label="Google Maps embed URL" value={s('mapsEmbed')} onChange={(v) => set('mapsEmbed', v)} textarea />
      <Text label="Google Maps direct share URL" value={s('mapsUrl')} onChange={(v) => set('mapsUrl', v)} />
      <div className="grid md:grid-cols-3 gap-4">
        <ImageField label="Logo" value={s('logo')} kind="icon" onChange={(v) => set('logo', v)} />
        <ImageField label="Hero banner" value={s('banner')} kind="photo" onChange={(v) => set('banner', v)} />
        <ImageField label="About image" value={s('aboutImage')} kind="photo" onChange={(v) => set('aboutImage', v)} />
      </div>
      <SaveBar onSave={save} saving={saving} />
    </div>
  );
};

// ---- Pricing ----
export const PricingEditor = () => {
  const { data } = usePricing();
  const qc = useQueryClient();
  const [f, setF] = useState<Record<string, number | string> | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data && !f) setF({
      basic30: data.basic[30], basic60: data.basic[60],
      weekdaySpecial: data.offers.weekdaySpecial, offPeakDiscount: data.offers.offPeakDiscount,
      gripSocks: data.gripSocks, gst: data.gst,
      weekdayOfferStart: data.hours.weekdayOfferStart, weekdayOfferEnd: data.hours.weekdayOfferEnd,
      offPeakStartDay: data.hours.offPeakStartDay, bookingLink: data.bookingLink,
    });
  }, [data, f]);
  if (!f) return <Loading />;
  const set = (k: string, v: number | string) => setF((p) => ({ ...p!, [k]: v }));
  const n = (k: string) => f[k] as number;
  const save = async () => {
    setSaving(true);
    try {
      await saveSettings('pricing', {
        bookingLink: f.bookingLink,
        basic: { 30: n('basic30'), 60: n('basic60') },
        offers: { weekdaySpecial: n('weekdaySpecial'), offPeakDiscount: n('offPeakDiscount') },
        gripSocks: n('gripSocks'), gst: n('gst'),
        hours: { weekdayOfferStart: n('weekdayOfferStart'), weekdayOfferEnd: n('weekdayOfferEnd'), offPeakStartDay: n('offPeakStartDay') },
      });
      qc.invalidateQueries({ queryKey: ['pricing'] });
      toast.success('Saved');
    } catch { toast.error('Save failed.'); } finally { setSaving(false); }
  };
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Pricing</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Num label="30 min price (₹)" value={n('basic30')} onChange={(v) => set('basic30', v)} />
        <Num label="60 min price (₹)" value={n('basic60')} onChange={(v) => set('basic60', v)} />
        <Num label="Weekday special (₹)" value={n('weekdaySpecial')} onChange={(v) => set('weekdaySpecial', v)} />
        <Num label="Off-peak discount (0–1)" value={n('offPeakDiscount')} onChange={(v) => set('offPeakDiscount', v)} step="0.05" />
        <Num label="Grip socks (₹)" value={n('gripSocks')} onChange={(v) => set('gripSocks', v)} />
        <Num label="GST (0–1)" value={n('gst')} onChange={(v) => set('gst', v)} step="0.01" />
        <Num label="Weekday offer start (hr 0–23)" value={n('weekdayOfferStart')} onChange={(v) => set('weekdayOfferStart', v)} />
        <Num label="Weekday offer end (hr 0–23)" value={n('weekdayOfferEnd')} onChange={(v) => set('weekdayOfferEnd', v)} />
        <Num label="Off-peak start (hr 0–23)" value={n('offPeakStartDay')} onChange={(v) => set('offPeakStartDay', v)} />
      </div>
      <Text label="Booking link (Calendly)" value={f.bookingLink as string} onChange={(v) => set('bookingLink', v)} />
      <SaveBar onSave={save} saving={saving} />
    </div>
  );
};

// ---- Cafe ----
export const CafeEditor = () => {
  const { data } = useCafe();
  const qc = useQueryClient();
  const [form, setForm] = useState<{ heading: string; intro: string; categories: { title: string; desc: string }[] } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data && !form) setForm({ heading: data.heading, intro: data.intro, categories: data.categories ?? [] }); }, [data, form]);
  if (!form) return <Loading />;
  const setCat = (i: number, key: 'title' | 'desc', v: string) =>
    setForm((p) => ({ ...p!, categories: p!.categories.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)) }));
  const addCat = () => setForm((p) => ({ ...p!, categories: [...p!.categories, { title: '', desc: '' }] }));
  const removeCat = (i: number) => setForm((p) => ({ ...p!, categories: p!.categories.filter((_, idx) => idx !== i) }));
  const save = async () => {
    setSaving(true);
    try { await saveSettings('cafe', form); qc.invalidateQueries({ queryKey: ['cafe'] }); toast.success('Saved'); }
    catch { toast.error('Save failed.'); } finally { setSaving(false); }
  };
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Cafe</h3>
      <Text label="Heading" value={form.heading} onChange={(v) => setForm((p) => ({ ...p!, heading: v }))} />
      <Text label="Intro" value={form.intro} onChange={(v) => setForm((p) => ({ ...p!, intro: v }))} textarea />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Categories</label>
          <button onClick={addCat} className="text-xs text-primary font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {form.categories.map((c, i) => (
          <div key={i} className="flex gap-3 items-end p-3 rounded-xl border border-border/40 bg-card/30">
            <div className="flex-1"><Text label="Title" value={c.title} onChange={(v) => setCat(i, 'title', v)} /></div>
            <div className="flex-[2]"><Text label="Description" value={c.desc} onChange={(v) => setCat(i, 'desc', v)} /></div>
            <button onClick={() => removeCat(i)} className="p-2 mb-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <SaveBar onSave={save} saving={saving} />
    </div>
  );
};

// ---- SMTP / Email ----
interface SmtpForm {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string; // write-only; blank = keep existing
  fromName: string;
  fromEmail: string;
  toEmail: string;
  hasPass: boolean;
}

export const SmtpEditor = () => {
  const [form, setForm] = useState<SmtpForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'settings', 'smtp'));
      const d = (snap.data() ?? {}) as Partial<SmtpForm> & { pass?: string };
      setForm({
        enabled: d.enabled ?? false,
        host: d.host ?? '',
        port: d.port ?? 587,
        secure: d.secure ?? false,
        user: d.user ?? '',
        pass: '', // never load the stored password into the field
        fromName: d.fromName ?? 'HavFun',
        fromEmail: d.fromEmail ?? '',
        toEmail: d.toEmail ?? 'havfuntrampolinepark@gmail.com',
        hasPass: !!d.pass,
      });
    })().catch(() => toast.error('Could not load SMTP settings (admin only).'));
  }, []);

  if (!form) return <Loading />;
  const set = (k: keyof SmtpForm, v: unknown) => setForm((p) => ({ ...p!, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        enabled: form.enabled,
        host: form.host,
        port: form.port,
        secure: form.secure,
        user: form.user,
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        toEmail: form.toEmail,
      };
      // Only overwrite the password when a new one is typed.
      if (form.pass.trim()) payload.pass = form.pass.trim();
      await saveSettings('smtp', payload);
      toast.success('SMTP settings saved');
      setForm((p) => ({ ...p!, pass: '', hasPass: p!.hasPass || !!p!.pass.trim() }));
    } catch {
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold">Email (SMTP)</h3>
        <p className="text-sm text-muted-foreground">
          Get notified by email on new bookings, waivers, and contact messages. Sent via Vercel.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="w-5 h-5 accent-primary" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} />
        <span className="text-sm font-medium">Enable email notifications</span>
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <Text label="SMTP Host (e.g. smtp.gmail.com)" value={form.host} onChange={(v) => set('host', v)} />
        <Num label="Port (587 or 465)" value={form.port} onChange={(v) => set('port', v)} />
        <Text label="Username" value={form.user} onChange={(v) => set('user', v)} />
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
            Password {form.hasPass && <span className="text-primary normal-case">(set — leave blank to keep)</span>}
          </label>
          <input
            type="password"
            placeholder={form.hasPass ? '••••••••' : 'App password'}
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
            value={form.pass}
            onChange={(e) => set('pass', e.target.value)}
          />
        </div>
        <Text label="From name" value={form.fromName} onChange={(v) => set('fromName', v)} />
        <Text label="From email" value={form.fromEmail} onChange={(v) => set('fromEmail', v)} />
        <Text label="Send notifications to" value={form.toEmail} onChange={(v) => set('toEmail', v)} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="w-5 h-5 accent-primary" checked={form.secure} onChange={(e) => set('secure', e.target.checked)} />
        <span className="text-sm">Use TLS/SSL (secure — usually on for port 465)</span>
      </label>

      <p className="text-[11px] text-muted-foreground">
        Tip: for Gmail, use an <b>App Password</b> (not your account password), host <code>smtp.gmail.com</code>, port 587.
      </p>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
};

const Loading = () => (
  <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
    <Loader2 className="w-5 h-5 animate-spin" /> Loading…
  </div>
);

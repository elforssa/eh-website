'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { TypeCours, Niveau, ModePaiement, Receipt } from '@/types/receipt'

const PDFDownloadButton = dynamic(
  () => import('@/components/admin/PDFDownloadButton').then(m => m.PDFDownloadButton),
  { ssr: false, loading: () => <button className="px-5 py-2.5 text-sm bg-surface border border-surface-active rounded-lg text-gray-400" disabled>Chargement PDF...</button> }
)

const TYPE_COURS: TypeCours[] = ['Enfants', 'Ados', 'Adultes', 'Business', 'Particulier']
const NIVEAUX: Niveau[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const MODES: ModePaiement[] = ['Espèces', 'Carte bancaire', 'Virement', 'Chèque']

const today = new Date().toISOString().split('T')[0]

interface FormState {
  date: string
  nom_prenom: string
  telephone: string
  email: string
  date_naissance: string
  type_cours: TypeCours
  niveau: Niveau
  duree_cours: string
  date_debut: string
  jours: string
  horaires: string
  montant_total: string
  montant_paye: string
  mode_paiement: ModePaiement
  observation: string
}

const defaultForm: FormState = {
  date: today,
  nom_prenom: '',
  telephone: '',
  email: '',
  date_naissance: '',
  type_cours: 'Adultes',
  niveau: 'A1',
  duree_cours: '',
  date_debut: '',
  jours: '',
  horaires: '',
  montant_total: '',
  montant_paye: '',
  mode_paiement: 'Espèces',
  observation: '',
}

export function ReceiptForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(null)

  const montantRestant =
    (parseFloat(form.montant_total) || 0) - (parseFloat(form.montant_paye) || 0)

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.nom_prenom.trim() || !form.telephone.trim() || !form.duree_cours.trim() ||
        !form.montant_total || !form.montant_paye) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          montant_total: parseFloat(form.montant_total),
          montant_paye: parseFloat(form.montant_paye),
          date_naissance: form.date_naissance || null,
          date_debut: form.date_debut || null,
          email: form.email || null,
          jours: form.jours || null,
          horaires: form.horaires || null,
          observation: form.observation || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur.')
      setSavedReceipt(data.receipt as Receipt)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-surface-active focus:outline-none focus:ring-2 focus:ring-navy-primary text-sm bg-white'
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'
  const sectionClass = 'mb-8'
  const sectionTitleClass = 'text-xs font-bold tracking-widest text-navy-primary uppercase border-b border-navy-primary pb-1 mb-4'

  if (savedReceipt) {
    return (
      <div className="max-w-3xl">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
          <span className="text-green-600 text-xl mt-0.5">✓</span>
          <div>
            <p className="font-semibold text-green-800">Reçu enregistré avec succès !</p>
            <p className="text-sm text-green-700 mt-0.5">
              N° <span className="font-mono font-bold">{savedReceipt.receipt_number}</span> — {savedReceipt.nom_prenom}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <PDFDownloadButton receipt={savedReceipt} />
          <button
            onClick={() => router.push(`/admin/receipts/${savedReceipt.id}`)}
            className="px-5 py-2.5 text-sm font-medium border border-surface-active rounded-lg text-navy-deep hover:bg-surface transition-colors"
          >
            Voir le reçu
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-5 py-2.5 text-sm font-medium border border-surface-active rounded-lg text-gray-500 hover:bg-surface transition-colors"
          >
            Tableau de bord
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl bg-white rounded-xl border border-surface-active p-4 sm:p-8">
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header fields */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Reçu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date *</label>
            <input type="date" className={inputClass} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>
      </div>

      {/* DONNÉES D'INSCRIPTION */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Données d&apos;inscription</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className={labelClass}>Nom et prénom *</label>
            <input type="text" className={inputClass} value={form.nom_prenom} onChange={e => set('nom_prenom', e.target.value)} placeholder="ex. Karim Benali" />
          </div>
          <div>
            <label className={labelClass}>Téléphone *</label>
            <input type="tel" className={inputClass} value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="ex. 0661 234 567" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ex. client@email.com" />
          </div>
          <div>
            <label className={labelClass}>Date de naissance</label>
            <input type="date" className={inputClass} value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} />
          </div>
        </div>
      </div>

      {/* DÉTAILS DU COURS */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Détails du cours</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Type de cours *</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_COURS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type_cours', t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.type_cours === t
                      ? 'bg-navy-deep text-white border-navy-deep'
                      : 'bg-white text-gray-600 border-surface-active hover:border-navy-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Niveau *</label>
              <div className="flex flex-wrap gap-2">
                {NIVEAUX.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set('niveau', n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.niveau === n
                        ? 'bg-navy-deep text-white border-navy-deep'
                        : 'bg-white text-gray-600 border-surface-active hover:border-navy-primary'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Durée du cours * (h/mois)</label>
              <input type="text" className={inputClass} value={form.duree_cours} onChange={e => set('duree_cours', e.target.value)} placeholder="ex. 20h/mois" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date de début</label>
              <input type="date" className={inputClass} value={form.date_debut} onChange={e => set('date_debut', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Jours</label>
              <input type="text" className={inputClass} value={form.jours} onChange={e => set('jours', e.target.value)} placeholder="ex. Lun, Mer, Ven" />
            </div>
            <div>
              <label className={labelClass}>Horaires</label>
              <input type="text" className={inputClass} value={form.horaires} onChange={e => set('horaires', e.target.value)} placeholder="ex. 18h–19h30" />
            </div>
          </div>
        </div>
      </div>

      {/* DÉTAILS DE PAIEMENT */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Détails de paiement</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Montant total du cours (MAD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.montant_total}
                onChange={e => set('montant_total', e.target.value)}
                placeholder="ex. 1500"
              />
            </div>
            <div>
              <label className={labelClass}>Montant payé ce jour (MAD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`${inputClass} bg-navy-deep/5 border-navy-primary`}
                value={form.montant_paye}
                onChange={e => set('montant_paye', e.target.value)}
                placeholder="ex. 750"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface px-4 py-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-600">Montant restant</span>
            <span className={`font-bold text-lg ${montantRestant > 0 ? 'text-red-accent' : 'text-green-600'}`}>
              {montantRestant.toLocaleString('fr-FR')} MAD
            </span>
          </div>

          <div>
            <label className={labelClass}>Mode de paiement *</label>
            <div className="flex flex-wrap gap-2">
              {MODES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('mode_paiement', m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.mode_paiement === m
                      ? 'bg-navy-deep text-white border-navy-deep'
                      : 'bg-white text-gray-600 border-surface-active hover:border-navy-primary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OBSERVATION */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Observation</h2>
        <textarea
          className={`${inputClass} h-24 resize-none`}
          value={form.observation}
          onChange={e => set('observation', e.target.value)}
          placeholder="Remarques, commentaires..."
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-navy-deep text-white text-sm font-semibold rounded-lg hover:bg-navy-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer le reçu'}
        </button>
        <button
          onClick={() => router.push('/admin/dashboard')}
          type="button"
          className="px-5 py-2.5 text-sm font-medium border border-surface-active rounded-lg text-gray-500 hover:bg-surface transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

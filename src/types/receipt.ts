export type TypeCours = 'Enfants' | 'Ados' | 'Adultes' | 'Business' | 'Particulier' | 'Préparation aux examens'
export type Niveau = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'CECRL'
export type ModePaiement = 'Espèces' | 'Carte bancaire' | 'Virement' | 'Chèque'
export type Formule = 'Standard' | 'Intensif'

export interface Receipt {
  id: string
  receipt_number: string
  date: string
  nom_prenom: string
  telephone: string
  email?: string | null
  date_naissance?: string | null
  type_cours: TypeCours
  niveau: Niveau
  duree_cours: string
  formule?: Formule | null
  date_debut?: string | null
  jours?: string | null
  horaires?: string | null
  montant_total: number
  montant_paye: number
  mode_paiement: ModePaiement
  observation?: string | null
  created_at: string
}

export type ReceiptFormData = Omit<Receipt, 'id' | 'receipt_number' | 'created_at'>

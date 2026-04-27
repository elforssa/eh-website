export type TypeCours = 'Enfants' | 'Ados' | 'Adultes' | 'Business' | 'Particulier'
export type Niveau = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type ModePaiement = 'Espèces' | 'Carte bancaire' | 'Virement' | 'Chèque'

export interface Receipt {
  id: string
  receipt_number: string
  date: string
  nom_prenom: string
  telephone: string
  email?: string
  date_naissance?: string
  type_cours: TypeCours
  niveau: Niveau
  duree_cours: string
  date_debut?: string
  jours?: string
  horaires?: string
  montant_total: number
  montant_paye: number
  mode_paiement: ModePaiement
  observation?: string
  created_at: string
}

export type ReceiptFormData = Omit<Receipt, 'id' | 'receipt_number' | 'created_at'>

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Receipt, ModePaiement } from '@/types/receipt'

const NAVY = '#0D2B5E'
const NAVY_MID = '#1E4D8B'
const RED = '#B91C2E'
const GRAY_LIGHT = '#F3F4F6'
const GRAY_TEXT = '#6B7280'
const GRAY_BORDER = '#E5E7EB'
const WHITE = '#FFFFFF'

// A5: 419 × 595 pt
const PAGE_W = 419
const PAD_H = 24
const PAD_V = 20

const s = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 8,
    width: PAGE_W,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: PAD_H,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  logo: { width: 52, height: 28, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: 0.4 },
  companySubtitle: { fontSize: 6, color: GRAY_TEXT, letterSpacing: 1.5, marginTop: 1 },
  companyAddress: { fontSize: 5.5, color: GRAY_TEXT, marginTop: 4, textAlign: 'right', lineHeight: 1.5 },
  companyContact: { fontSize: 5.5, color: NAVY_MID, marginTop: 1 },

  // Title bar
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingHorizontal: PAD_H,
    paddingVertical: 7,
  },
  titleText: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: WHITE, flex: 1, letterSpacing: 0.8 },
  titleBoxes: { flexDirection: 'row', gap: 6 },
  titleBox: {
    backgroundColor: GRAY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    alignItems: 'center',
    minWidth: 72,
  },
  titleBoxLabel: { fontSize: 5, color: GRAY_TEXT, letterSpacing: 1.2, textTransform: 'uppercase' },
  titleBoxValue: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: NAVY, marginTop: 1 },

  // Content
  content: { paddingHorizontal: PAD_H, paddingTop: 10, paddingBottom: PAD_V },

  // Section
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY_MID,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: NAVY_MID,
    paddingBottom: 2,
    marginBottom: 8,
  },

  // Two-column row
  row2: { flexDirection: 'row', gap: 10, marginBottom: 8 },

  // Three-column row
  row3: { flexDirection: 'row', gap: 8, marginBottom: 8 },

  // Individual field (inside a row or standalone)
  fieldWrap: { flex: 1, borderBottomWidth: 1, borderBottomColor: GRAY_BORDER, paddingBottom: 4 },
  fieldLabel: { fontSize: 6, color: GRAY_TEXT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  fieldValue: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#1F2937' },

  // Checkbox group (course type / level) — each on its own row
  checkGroupWrap: { marginBottom: 10 },
  checkGroupLabel: { fontSize: 6, color: GRAY_TEXT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  checkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  checkBox: { width: 9, height: 9, borderWidth: 1, borderColor: GRAY_BORDER, borderRadius: 1 },
  checkBoxFilled: { width: 9, height: 9, backgroundColor: NAVY, borderRadius: 1, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: WHITE, fontSize: 6, fontFamily: 'Helvetica-Bold' },
  checkLabel: { fontSize: 7.5, color: GRAY_TEXT },
  checkLabelSelected: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: NAVY },

  // Payment table
  payTable: { borderWidth: 1, borderColor: GRAY_BORDER, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  payRowHighlight: { backgroundColor: NAVY },
  payRowAlt: { backgroundColor: GRAY_LIGHT },
  payLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#374151' },
  payLabelWhite: { color: WHITE },
  payValue: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#374151' },
  payValueWhite: { color: WHITE },
  payValueRed: { color: RED },

  // Mode de paiement checkboxes (same checkbox style, horizontal)
  modeGroupLabel: { fontSize: 6, color: GRAY_TEXT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  modeRow: { flexDirection: 'row', gap: 14, marginBottom: 8 },

  // Signature — admin / center only
  sigRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: GRAY_BORDER },
  sigBox: { width: 140, alignItems: 'center' },
  sigLine: { width: '100%', borderBottomWidth: 1, borderBottomColor: GRAY_BORDER, marginBottom: 4, height: 28 },
  sigLabel: { fontSize: 5.5, color: GRAY_TEXT, letterSpacing: 1, textTransform: 'uppercase' },

  // Footer
  footer: {
    backgroundColor: GRAY_LIGHT,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    paddingHorizontal: PAD_H,
    paddingVertical: 6,
    alignItems: 'center',
  },
  footerBrand: { fontSize: 6, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 1 },
  footerContact: { fontSize: 5.5, color: GRAY_TEXT },
})

function CheckItem({ selected, label }: { selected: boolean; label: string }) {
  return (
    <View style={s.checkItem}>
      {selected ? (
        <View style={s.checkBoxFilled}>
          <Text style={s.checkMark}>✓</Text>
        </View>
      ) : (
        <View style={s.checkBox} />
      )}
      <Text style={selected ? s.checkLabelSelected : s.checkLabel}>{label}</Text>
    </View>
  )
}

function Field({ label, value, flex }: { label: string; value?: string; flex?: number }) {
  return (
    <View style={[s.fieldWrap, flex !== undefined ? { flex } : {}]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value || '—'}</Text>
    </View>
  )
}

export function ReceiptDocument({ receipt, logoUrl }: { receipt: Receipt; logoUrl: string }) {
  const restant = Number(receipt.montant_total) - Number(receipt.montant_paye)
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
  const fmtNum = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const modePaiements: ModePaiement[] = ['Espèces', 'Carte bancaire', 'Virement', 'Chèque']
  const typeCours = ['Enfants', 'Ados', 'Adultes', 'Business', 'Particulier']
  const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  return (
    <Document>
      <Page size="A5" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <Image src={logoUrl} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.companyName}>ENGLISH HILLS</Text>
            <Text style={s.companySubtitle}>ENGLISH LANGUAGE CENTER</Text>
            <Text style={s.companyAddress}>
              Centre Almaz, Etg 1 N° 6, Oulad Azouz{'\n'}
              Nouaceur, Casablanca 20000 — Maroc{'\n'}
              Tél : 0664 23 90 91
            </Text>
            <Text style={s.companyContact}>contact@english-hills.com</Text>
          </View>
        </View>

        {/* TITLE BAR */}
        <View style={s.titleBar}>
          <Text style={s.titleText}>REÇU DE PAIEMENT</Text>
          <View style={s.titleBoxes}>
            <View style={s.titleBox}>
              <Text style={s.titleBoxLabel}>N° DE REÇU</Text>
              <Text style={s.titleBoxValue}>{receipt.receipt_number}</Text>
            </View>
            <View style={s.titleBox}>
              <Text style={s.titleBoxLabel}>DATE</Text>
              <Text style={s.titleBoxValue}>{fmtDate(receipt.date)}</Text>
            </View>
          </View>
        </View>

        <View style={s.content}>

          {/* DONNÉES D'INSCRIPTION */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Données d'inscription</Text>
            <View style={s.row2}>
              <Field label="NOM ET PRÉNOM" value={receipt.nom_prenom} />
              <Field label="TÉLÉPHONE" value={receipt.telephone} />
            </View>
            <View style={s.row2}>
              <Field label="EMAIL" value={receipt.email} />
              <Field label="DATE DE NAISSANCE" value={fmtDate(receipt.date_naissance)} />
            </View>
          </View>

          {/* DÉTAILS DU COURS */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Détails du cours</Text>

            {/* TYPE DE COURS — full dedicated row */}
            <View style={s.checkGroupWrap}>
              <Text style={s.checkGroupLabel}>TYPE DE COURS</Text>
              <View style={s.checkRow}>
                {typeCours.map(t => (
                  <CheckItem key={t} label={t} selected={receipt.type_cours === t} />
                ))}
              </View>
            </View>

            {/* NIVEAU — full dedicated row */}
            <View style={s.checkGroupWrap}>
              <Text style={s.checkGroupLabel}>NIVEAU</Text>
              <View style={s.checkRow}>
                {niveaux.map(n => (
                  <CheckItem key={n} label={n} selected={receipt.niveau === n} />
                ))}
              </View>
            </View>

            <View style={s.row3}>
              <Field label="DURÉE DU COURS" value={receipt.duree_cours} />
              <Field label="DATE DE DÉBUT" value={fmtDate(receipt.date_debut)} />
              <Field label="JOURS" value={receipt.jours} />
              <Field label="HORAIRES" value={receipt.horaires} />
            </View>
          </View>

          {/* DÉTAILS DE PAIEMENT */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Détails de paiement</Text>
            <View style={s.payTable}>
              <View style={s.payRow}>
                <Text style={s.payLabel}>Montant total du cours</Text>
                <Text style={s.payValue}>{fmtNum(Number(receipt.montant_total))} MAD</Text>
              </View>
              <View style={[s.payRow, s.payRowHighlight]}>
                <Text style={[s.payLabel, s.payLabelWhite]}>Montant payé ce jour</Text>
                <Text style={[s.payValue, s.payValueWhite]}>{fmtNum(Number(receipt.montant_paye))} MAD</Text>
              </View>
              <View style={[s.payRow, s.payRowAlt]}>
                <Text style={s.payLabel}>Montant restant</Text>
                <Text style={[s.payValue, s.payValueRed]}>{fmtNum(restant)} MAD</Text>
              </View>
            </View>

            <Text style={s.modeGroupLabel}>MODE DE PAIEMENT</Text>
            <View style={s.modeRow}>
              {modePaiements.map(m => (
                <CheckItem key={m} label={m} selected={receipt.mode_paiement === m} />
              ))}
            </View>
          </View>

          {/* SIGNATURE — center stamp only */}
          <View style={s.sigRow}>
            <View style={s.sigBox}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Cachet et signature du centre</Text>
            </View>
          </View>

        </View>

        {/* FOOTER */}
        <View style={s.footer}>
          <Text style={s.footerBrand}>English Hills • Learn Today, Lead Tomorrow</Text>
          <Text style={s.footerContact}>
            Centre Almaz, Etg 1 N° 6, Oulad Azouz, Nouaceur — Casablanca 20000 | Tél : 0664 23 90 91 | contact@english-hills.com
          </Text>
        </View>

      </Page>
    </Document>
  )
}

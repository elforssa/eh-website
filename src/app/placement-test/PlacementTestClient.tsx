"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2, Calendar } from "lucide-react";

type Slot = { id: string; time: string };
type GroupedSlots = Record<string, Slot[]>;

export default function PlacementTestClient() {
  const [slots, setSlots] = useState<GroupedSlots>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age_group: "",
    goal: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/slots');
        if (res.ok) {
          const data = await res.json();
          setSlots(data);
        } else {
          setSlotsError(true);
        }
      } catch {
        setSlotsError(true);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const resetForm = () => {
    setSuccessData(null);
    setFormData({ name: "", email: "", phone: "", age_group: "", goal: "" });
    setSelectedDate(null);
    setSelectedSlotId(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedSlotId) {
      setErrorMsg("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: selectedSlotId, ...formData })
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Une erreur est survenue. Veuillez réessayer.");
      } else {
        setSuccessData({ date: result.bookedDate, time: result.bookedTime });

        setSlots(prev => {
          const updated = { ...prev };
          if (updated[result.bookedDate]) {
            updated[result.bookedDate] = updated[result.bookedDate].filter(s => s.id !== selectedSlotId);
            if (updated[result.bookedDate].length === 0) delete updated[result.bookedDate];
          }
          return updated;
        });
      }
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableDates = Object.keys(slots).sort();

  return (
    <div className="py-16 md:py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            100% Gratuit · Sans engagement
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Réserver votre test de niveau</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Faites le premier pas vers un anglais fluide. Notre test garantit que vous intégrez le groupe parfaitement adapté à votre niveau.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-navy text-sm">Entièrement gratuit</p>
                <p className="text-gray-500 text-xs mt-0.5">Zéro frais, toujours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-navy text-sm">Sans inscription obligatoire</p>
                <p className="text-gray-500 text-xs mt-0.5">Vous êtes libre de partir.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-navy text-sm">Sans pression</p>
                <p className="text-gray-500 text-xs mt-0.5">Juste un bilan bienveillant.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden">
          {successData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy mb-4">C&apos;est confirmé !</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                On vous attend le <strong className="text-foreground">{successData.date}</strong> à <strong className="text-foreground">{successData.time}</strong>. Notre équipe vous contactera pour confirmer les détails.
              </p>
              <Button onClick={resetForm} variant="secondary-navy">
                Réserver un autre créneau
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>

              {/* Vos informations */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-navy border-b pb-3">1. Vos informations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-navy">Nom complet <span aria-hidden="true">*</span></label>
                    <input
                      type="text"
                      id="name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-navy">Adresse e-mail <span aria-hidden="true">*</span></label>
                    <input
                      type="email"
                      id="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-navy">Téléphone / WhatsApp <span aria-hidden="true">*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                      placeholder="+212 6 64 23 90 91"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="age_group" className="block text-sm font-medium text-navy">Tranche d&apos;âge <span aria-hidden="true">*</span></label>
                    <select
                      id="age_group"
                      required
                      value={formData.age_group}
                      onChange={handleChange}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors bg-white"
                    >
                      <option value="">Choisir une option…</option>
                      <option value="kids">Enfants & Juniors (6–17 ans)</option>
                      <option value="adults">Adultes (18 ans et +)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="goal" className="block text-sm font-medium text-navy">Votre objectif <span className="text-gray-400 font-normal">(facultatif)</span></label>
                  <input
                    type="text"
                    id="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                    placeholder="Ex : améliorer mon anglais au travail, préparer l'IELTS…"
                  />
                </div>
              </div>

              {/* Choisir une date et un créneau */}
              <div className="space-y-6 pt-4 border-t">
                <h2 className="text-xl font-bold text-navy mb-4">2. Choisir une date et un créneau</h2>

                {loadingSlots ? (
                  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <Loader2 className="w-6 h-6 text-navy animate-spin mr-3" aria-hidden="true" />
                    <span className="text-gray-500">Chargement des créneaux disponibles…</span>
                  </div>
                ) : slotsError ? (
                  <div role="alert" className="p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                    <p className="text-red-800 font-medium">Impossible de charger les créneaux disponibles.</p>
                    <p className="text-red-600 text-sm mt-1">Contactez-nous directement au <a href="tel:+212664239091" className="underline">+212 6 64 23 90 91</a>.</p>
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="p-8 bg-orange-50 rounded-xl border border-orange-100 text-center">
                    <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-orange-800 font-medium">Aucun créneau disponible pour le moment.</p>
                    <p className="text-orange-600 text-sm mt-1">Contactez-nous au <a href="tel:+212664239091" className="underline">+212 6 64 23 90 91</a> pour convenir d&apos;une date.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">Dates disponibles</p>
                      <div className="flex flex-wrap gap-3">
                        {availableDates.map(dateStr => {
                          const dateObj = new Date(dateStr + 'T00:00:00');
                          const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
                          const dayNum = dateObj.toLocaleDateString('fr-FR', { day: 'numeric' });
                          const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
                          const isSelected = selectedDate === dateStr;

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => { setSelectedDate(dateStr); setSelectedSlotId(null); }}
                              aria-pressed={isSelected}
                              aria-label={`Sélectionner le ${dayName} ${dayNum} ${monthName}`}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border-2 transition-all ${isSelected ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/30 hover:bg-gray-50'}`}
                            >
                              <span className={`text-xs font-bold uppercase ${isSelected ? 'text-navy' : 'text-gray-400'}`}>{dayName}</span>
                              <span className={`text-2xl font-bold my-1 ${isSelected ? 'text-navy' : 'text-gray-700'}`}>{dayNum}</span>
                              <span className={`text-xs font-semibold ${isSelected ? 'text-navy' : 'text-gray-500'}`}>{monthName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <p className="text-sm font-medium text-gray-500 mb-3">Créneaux disponibles le {selectedDate}</p>
                        <div className="flex flex-wrap gap-3">
                          {slots[selectedDate]?.map(slot => {
                            const isSelected = selectedSlotId === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlotId(slot.id)}
                                aria-pressed={isSelected}
                                aria-label={`Sélectionner le créneau ${slot.time}`}
                                className={`px-6 py-3 rounded-lg font-bold transition-all ${isSelected ? 'bg-red-accent text-white shadow-md -translate-y-0.5' : 'bg-navy/10 text-navy hover:bg-navy hover:text-white'}`}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {errorMsg && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !selectedSlotId}
                  variant="primary-red"
                  className={`w-full py-4 text-lg ${!selectedSlotId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-disabled={submitting || !selectedSlotId}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Traitement en cours…
                    </span>
                  ) : "Confirmer la réservation"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

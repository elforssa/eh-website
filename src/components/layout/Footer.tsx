import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/Button";

export function Footer() {
  return (
    <footer className="bg-foreground text-surface pt-20 pb-12 border-t border-surface-active">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6 -ml-2">
              <Image
                src="/eh-logo-new.png"
                alt="English Hills"
                width={400}
                height={160}
                className="h-14 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400 mb-8 font-light text-sm leading-relaxed">
              Rendre l&apos;anglais captivant, efficace et fun pour tous les âges.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/englishhills.casablanca/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a
                href="https://www.instagram.com/englishhills/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a
                href="https://wa.me/212664239091"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6 text-white tracking-wide">Programmes</h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li><Link href="/programs/kids" className="text-gray-400 hover:text-white transition-colors">Enfants & Juniors</Link></li>
              <li><Link href="/programs/general-english" className="text-gray-400 hover:text-white transition-colors">Anglais général</Link></li>
              <li><Link href="/programs/business-english" className="text-gray-400 hover:text-white transition-colors">Business English</Link></li>
              <li><Link href="/programs/exam-prep" className="text-gray-400 hover:text-white transition-colors">Prépa examens</Link></li>
              <li><Link href="/programs/short-courses" className="text-gray-400 hover:text-white transition-colors">Formations courtes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6 text-white tracking-wide">À propos</h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Qui sommes-nous</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/placement-test" className="text-gray-400 hover:text-white transition-colors">Test de niveau</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6 text-white tracking-wide">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400 mb-8">
              <li>
                <a href="mailto:contact@english-hills.com" className="hover:text-white transition-colors">contact@english-hills.com</a>
              </li>
              <li>
                <a href="tel:+212687347926" className="hover:text-white transition-colors">+212 6 87 34 79 26</a>
              </li>
              <li>Almaz 2, Hills Business Center<br/>Bâtiment B, Bureau 6<br/>Casablanca</li>
            </ul>
            <Button href="/contact" variant="primary-red" className="w-full sm:w-auto">
              Nous contacter
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500 font-medium tracking-wide">
          <p>© {new Date().getFullYear()} English Hills Language Center.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

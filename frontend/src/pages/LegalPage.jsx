const legalContent = {
  fr: {
    privacy: {
      title: "Politique de confidentialite",
      paragraphs: [
        "Frovely traite les donnees de compte et les abonnements afin de fournir le service, proteger les acces, envoyer les rappels demandes et produire des compteurs produits agreges.",
        "Les donnees ne sont ni vendues ni utilisees pour de la publicite ciblee. Les rappels email reposent sur les preferences du compte et peuvent etre desactives dans le profil.",
        "Vous pouvez exporter vos donnees ou supprimer votre compte depuis votre profil. Les donnees sont alors supprimees selon les obligations legales applicables."
      ]
    },
    terms: {
      title: "Conditions generales d'utilisation",
      paragraphs: [
        "Frovely aide a suivre des abonnements et leurs renouvellements. Le service ne modifie jamais un contrat tiers et ne garantit pas l'annulation d'un paiement.",
        "L'utilisateur reste responsable des informations saisies, de ses contrats et de ses decisions de paiement. L'acces beta peut etre limite, suspendu ou modifie pendant les tests.",
        "Le service est fourni sans paiement durant cette beta privee. Toute offre Premium et toute facturation feront l'objet de conditions distinctes avant leur activation."
      ]
    },
    legal: {
      title: "Mentions legales",
      paragraphs: [
        "Editeur: informations juridiques a renseigner avant toute ouverture publique. Contact beta prevu: support@frovely.app.",
        "Hebergement: Render. Les donnees de production seront hebergees dans la region europeenne configuree pour Frovely.",
        "Les personnes concernees disposent notamment de droits d'acces, de rectification, d'effacement, de limitation et d'opposition conformement au RGPD."
      ]
    },
    notice: "La raison sociale, l'adresse, le responsable de publication, l'email support actif, les durees de conservation et l'autorite de controle doivent etre valides avant toute ouverture publique."
  },
  en: {
    privacy: {
      title: "Privacy policy",
      paragraphs: [
        "Frovely processes account data and subscriptions to provide the service, secure access, send requested reminders, and create aggregate product counters.",
        "Data is not sold or used for targeted advertising. Email reminders follow account preferences and can be disabled from the profile.",
        "You can export your data or delete your account from your profile. Data is then removed subject to applicable legal obligations."
      ]
    },
    terms: {
      title: "Terms of use",
      paragraphs: [
        "Frovely helps track subscriptions and renewals. It never changes a third-party contract and does not guarantee that a payment can be cancelled.",
        "Users remain responsible for entered information, their contracts, and payment decisions. Beta access may be limited, suspended, or changed while the service is tested.",
        "The private beta is provided without payment. Any Premium offer and billing terms will be published before activation."
      ]
    },
    legal: {
      title: "Legal notice",
      paragraphs: [
        "Publisher: legal information must be completed before any public opening. Planned beta contact: support@frovely.app.",
        "Hosting: Render. Production data will be hosted in the European region configured for Frovely.",
        "Data subjects have rights of access, rectification, erasure, restriction, and objection under the GDPR."
      ]
    },
    notice: "The legal entity, address, publication director, active support email, retention periods, and supervisory authority must be validated before public registration is enabled."
  },
  es: {
    privacy: {
      title: "Politica de privacidad",
      paragraphs: [
        "Frovely trata los datos de cuenta y las suscripciones para prestar el servicio, proteger el acceso, enviar recordatorios solicitados y crear contadores agregados.",
        "Los datos no se venden ni se usan para publicidad dirigida. Los recordatorios por correo siguen las preferencias de la cuenta y se pueden desactivar desde el perfil.",
        "Puedes exportar tus datos o eliminar tu cuenta desde tu perfil. Los datos se eliminan conforme a las obligaciones legales aplicables."
      ]
    },
    terms: {
      title: "Condiciones de uso",
      paragraphs: [
        "Frovely ayuda a seguir suscripciones y renovaciones. Nunca modifica un contrato de terceros ni garantiza la cancelacion de un pago.",
        "Las personas usuarias son responsables de la informacion introducida, sus contratos y sus decisiones de pago. El acceso beta puede limitarse, suspenderse o cambiarse durante las pruebas.",
        "La beta privada se ofrece sin pago. Cualquier oferta Premium y sus condiciones de facturacion se publicaran antes de su activacion."
      ]
    },
    legal: {
      title: "Aviso legal",
      paragraphs: [
        "Editor: la informacion legal debe completarse antes de cualquier apertura publica. Contacto beta previsto: support@frovely.app.",
        "Alojamiento: Render. Los datos de produccion se alojaran en la region europea configurada para Frovely.",
        "Las personas interesadas tienen derechos de acceso, rectificacion, supresion, limitacion y oposicion conforme al RGPD."
      ]
    },
    notice: "La entidad legal, direccion, responsable de publicacion, correo de soporte activo, plazos de conservacion y autoridad supervisora deben validarse antes de habilitar el registro publico."
  }
};

export function LegalPage({ kind = "privacy", language = "fr" }) {
  const contentByLanguage = legalContent[language] ?? legalContent.fr;
  const content = contentByLanguage[kind] ?? contentByLanguage.privacy;

  return (
    <main className="grid min-h-[100svh] bg-[#F6F7FB] px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-slate-900 sm:px-8">
      <section className="mx-auto w-full max-w-2xl self-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#7047EB] hover:underline"><i className="ph-bold ph-arrow-left" /> Frovely</a>
        <p className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">Private beta</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{content.title}</h1>
        <div className="mt-6 grid gap-4 text-[15px] leading-7 text-slate-700 sm:text-base">{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">{contentByLanguage.notice}</p>
        <nav className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-[#7047EB]"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a></nav>
      </section>
    </main>
  );
}

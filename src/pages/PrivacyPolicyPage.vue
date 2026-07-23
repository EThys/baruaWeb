<template>
  <div class="privacy-page">
    <!-- Hero -->
    <header class="relative overflow-hidden bg-hero-gradient">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" aria-hidden="true" />
      <div
        class="absolute inset-0 bg-gradient-to-b from-brand-dark/15 via-transparent to-brand-dark/25 pointer-events-none"
        aria-hidden="true"
      />
      <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none flex items-center justify-end overflow-hidden" aria-hidden="true">
        <img
          :src="armoiryImg"
          alt=""
          class="w-[min(80vw,420px)] h-auto max-h-[360px] -mr-16 sm:-mr-24 object-contain opacity-[0.1] select-none"
        />
      </div>

      <div
        class="page-container relative z-10 py-14 sm:py-16"
        v-reveal="{ stagger: '[data-reveal-item]', staggerMs: 100, variant: 'up', once: true }"
      >
        <p data-reveal-item class="font-display font-bold text-white/95 text-2xl sm:text-3xl tracking-wide mb-4">
          BARUA
        </p>
        <div
          data-reveal-item
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-50 backdrop-blur-sm mb-5"
        >
          <ShieldCheck :size="14" class="text-rdc-yellow" />
          Protection des données · Code du numérique RDC
        </div>
        <h1
          data-reveal-item
          class="font-display font-bold text-white text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight max-w-3xl"
        >
          Politique de confidentialité
        </h1>
        <p data-reveal-item class="mt-4 text-blue-100/90 max-w-2xl text-sm sm:text-base leading-relaxed">
          Comment Barua Officiel collecte, utilise, protège et traite vos données à caractère personnel.
        </p>
        <p data-reveal-item class="mt-5 text-xs text-blue-200/80">
          Dernière mise à jour : <time datetime="2026-03-12">12 mars 2026</time>
        </p>
      </div>

      <div class="flex h-1 sm:h-1.5 w-full" aria-hidden="true">
        <div class="flex-1 bg-rdc-yellow" />
        <div class="flex-1 bg-rdc-blue" />
        <div class="flex-1 bg-rdc-red" />
      </div>
    </header>

    <!-- Principes clés -->
    <section class="page-container -mt-8 relative z-20 mb-10 sm:mb-14">
      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        v-reveal="{ stagger: '[data-pill]', staggerMs: 80, variant: 'up', once: true }"
      >
        <div
          v-for="pill in pillars"
          :key="pill.title"
          data-pill
          class="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm ring-1 ring-slate-900/5"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand mb-3">
            <component :is="pill.icon" :size="20" />
          </div>
          <p class="font-semibold text-slate-900 text-sm">{{ pill.title }}</p>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ pill.text }}</p>
        </div>
      </div>
    </section>

    <!-- Corps -->
    <div class="page-container pb-16 lg:pb-24">
      <div class="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <!-- Sommaire -->
        <aside class="hidden lg:block">
          <nav
            class="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 max-h-[calc(100vh-7rem)] overflow-y-auto"
            aria-label="Sommaire"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">
              Sommaire
            </p>
            <ul class="space-y-0.5">
              <li v-for="section in sections" :key="section.id">
                <a
                  :href="`#${section.id}`"
                  class="block rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition-colors"
                  :class="activeId === section.id
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'"
                  @click="onTocClick(section.id)"
                >
                  <span class="text-slate-400 font-mono text-[11px] mr-1.5">{{ section.num }}</span>
                  {{ section.shortTitle || section.title }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Contenu -->
        <article class="min-w-0">
          <!-- Sommaire mobile -->
          <details class="lg:hidden mb-8 group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <summary class="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3.5 font-semibold text-slate-900 text-sm">
              Sommaire
              <ChevronDown :size="18" class="text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul class="border-t border-slate-200 px-2 py-2 space-y-0.5">
              <li v-for="section in sections" :key="`m-${section.id}`">
                <a
                  :href="`#${section.id}`"
                  class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white"
                  @click="onTocClick(section.id)"
                >
                  {{ section.num }}. {{ section.title }}
                </a>
              </li>
            </ul>
          </details>

          <div class="space-y-10 sm:space-y-12">
            <section
              v-for="section in sections"
              :id="section.id"
              :key="section.id"
              class="privacy-section scroll-mt-28"
              v-reveal="{ variant: 'up', duration: 700, once: true }"
            >
              <div class="flex items-start gap-3 sm:gap-4 mb-4">
                <span
                  class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white text-sm font-bold font-display shadow-sm"
                >
                  {{ section.num }}
                </span>
                <h2 class="font-display font-bold text-xl sm:text-2xl text-slate-900 leading-snug pt-1">
                  {{ section.title }}
                </h2>
              </div>

              <div class="sm:pl-[3.25rem] space-y-3 text-[15px] text-slate-600 leading-relaxed">
                <p v-for="(p, i) in section.paragraphs" :key="i" v-html="p" />

                <ul v-if="section.bullets?.length" class="space-y-2 mt-2">
                  <li
                    v-for="(b, i) in section.bullets"
                    :key="i"
                    class="flex gap-2.5"
                  >
                    <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    <span v-html="b" />
                  </li>
                </ul>

                <div
                  v-if="section.callout"
                  class="mt-4 rounded-xl border border-brand/15 bg-brand/5 px-4 py-3.5 text-sm text-slate-700"
                >
                  <p class="font-semibold text-brand mb-1">{{ section.callout.title }}</p>
                  <p class="leading-relaxed" v-html="section.callout.text" />
                </div>
              </div>
            </section>
          </div>

          <!-- Contact CTA -->
          <div
            class="mt-14 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-50 to-white relative"
            v-reveal="{ variant: 'scale', duration: 800, once: true }"
          >
            <div class="absolute inset-0 jacquard-bg opacity-[0.05] pointer-events-none" aria-hidden="true" />
            <div class="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                <Mail :size="22" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-display font-bold text-lg text-slate-900">Questions sur vos données ?</h3>
                <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                  Pour exercer vos droits ou toute demande relative à la protection des données,
                  contactez-nous au
                  <a href="tel:+243900727272" class="font-semibold text-brand hover:underline whitespace-nowrap">
                    +243 900 727 272
                  </a>.
                </p>
              </div>
              <RouterLink
                to="/faq"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark transition-colors shrink-0"
              >
                Voir la FAQ
                <ArrowRight :size="16" />
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  ChevronDown,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
} from 'lucide-vue-next'
import armoiryImg from '@/assets/armoiry.png'

const activeId = ref('introduction')

const pillars = [
  {
    icon: Lock,
    title: 'Données minimisées',
    text: 'Nous ne collectons que ce qui est strictement nécessaire aux services.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité renforcée',
    text: 'HTTPS/TLS, contrôle d’accès et surveillance continue de l’infrastructure.',
  },
  {
    icon: Scale,
    title: 'Cadre légal RDC',
    text: 'Conformité au Code du numérique de la République démocratique du Congo.',
  },
]

interface PrivacySection {
  id: string
  num: string
  title: string
  shortTitle?: string
  paragraphs: string[]
  bullets?: string[]
  callout?: { title: string; text: string }
}

const sections: PrivacySection[] = [
  {
    id: 'introduction',
    num: '1',
    title: 'Introduction',
    paragraphs: [
      'La présente Politique de confidentialité décrit la manière dont <strong>Barua Officiel</strong> (« Barua », « nous », « notre » ou « nos ») collecte, utilise, protège et traite les données à caractère personnel des utilisateurs de sa plateforme.',
      'Nous nous engageons à respecter les dispositions du <strong>Code du numérique de la République démocratique du Congo</strong>, notamment celles relatives à la protection des données personnelles, ainsi que les bonnes pratiques internationales en matière de sécurité et de confidentialité.',
    ],
  },
  {
    id: 'responsable',
    num: '2',
    title: 'Responsable du traitement',
    shortTitle: 'Responsable',
    paragraphs: [
      'Le responsable du traitement des données est :',
      '<strong>Barua Officiel</strong>',
      'Les coordonnées du responsable du traitement sont disponibles sur notre plateforme, notamment au <a href="tel:+243900727272" class="text-brand font-semibold hover:underline">+243 900 727 272</a>.',
    ],
  },
  {
    id: 'donnees-collectees',
    num: '3',
    title: 'Données collectées',
    shortTitle: 'Données collectées',
    paragraphs: [
      'Selon les services utilisés, nous pouvons collecter notamment :',
    ],
    bullets: [
      'nom et prénom ;',
      'adresse électronique ;',
      'numéro de téléphone ;',
      'informations d’identification ;',
      'informations relatives aux organisations représentées ;',
      'données nécessaires à la fourniture des services administratifs ou privés ;',
      'journaux techniques (logs) permettant d’assurer la sécurité de la plateforme ;',
      'adresse IP, navigateur et informations techniques de connexion.',
    ],
    callout: {
      title: 'Principe de minimisation',
      text: 'Nous ne collectons que les données strictement nécessaires à la fourniture des services.',
    },
  },
  {
    id: 'finalites',
    num: '4',
    title: 'Finalités du traitement',
    shortTitle: 'Finalités',
    paragraphs: [
      'Les données sont utilisées uniquement afin de :',
    ],
    bullets: [
      'créer et gérer votre compte ;',
      'fournir les services proposés par Barua ;',
      'traiter les demandes adressées aux administrations ou organismes partenaires ;',
      'sécuriser la plateforme ;',
      'prévenir les fraudes ;',
      'assurer le support utilisateur ;',
      'satisfaire aux obligations légales.',
    ],
    callout: {
      title: 'Engagement',
      text: 'Nous n’utilisons jamais les données personnelles à des fins de revente ou de profilage commercial.',
    },
  },
  {
    id: 'base-juridique',
    num: '5',
    title: 'Base juridique',
    paragraphs: [
      'Le traitement repose notamment sur :',
    ],
    bullets: [
      'votre consentement lorsque celui-ci est requis ;',
      'l’exécution du service demandé ;',
      'le respect des obligations légales ;',
      'notre intérêt légitime consistant à garantir la sécurité et le bon fonctionnement de la plateforme.',
    ],
  },
  {
    id: 'hebergement',
    num: '6',
    title: 'Hébergement et infrastructure',
    shortTitle: 'Hébergement',
    paragraphs: [
      'Barua exploite une infrastructure cloud sécurisée.',
      'Nos services techniques s’appuient notamment sur :',
    ],
    bullets: [
      '<strong>Hetzner</strong>, utilisé comme infrastructure d’exécution et d’hébergement des serveurs ;',
      '<strong>Supabase</strong>, utilisé comme plateforme de gestion des bases de données et des services applicatifs.',
    ],
    callout: {
      title: 'Sous-traitants techniques',
      text: 'Ces fournisseurs interviennent uniquement en qualité de sous-traitants techniques. Ils ne peuvent traiter les données que conformément à nos instructions et aux exigences contractuelles applicables.',
    },
  },
  {
    id: 'partage',
    num: '7',
    title: 'Partage des données',
    shortTitle: 'Partage',
    paragraphs: [
      'Barua ne vend, ne loue ni ne cède les données personnelles à des tiers.',
      'Les données peuvent uniquement être transmises :',
    ],
    bullets: [
      'à une administration publique lorsque l’utilisateur sollicite volontairement un service administratif via Barua ;',
      'à un organisme privé expressément sélectionné par l’utilisateur afin d’exécuter un service demandé sur la plateforme ;',
      'lorsqu’une obligation légale l’impose.',
    ],
    callout: {
      title: 'Principe',
      text: 'En dehors de ces situations, aucune donnée n’est communiquée à un tiers.',
    },
  },
  {
    id: 'services-prives',
    num: '8',
    title: 'Services privés intégrés',
    shortTitle: 'Services privés',
    paragraphs: [
      'Barua permet l’interaction avec certains services privés. Dans ce cadre :',
    ],
    bullets: [
      'seules les informations strictement nécessaires à l’exécution du service demandé sont transmises ;',
      'cette transmission intervient uniquement à la demande explicite de l’utilisateur ;',
      'les partenaires ne peuvent utiliser ces données pour d’autres finalités.',
    ],
  },
  {
    id: 'securite',
    num: '9',
    title: 'Sécurité',
    paragraphs: [
      'Nous appliquons des mesures techniques et organisationnelles destinées à protéger les données personnelles contre :',
    ],
    bullets: [
      'les accès non autorisés ;',
      'la perte de données ;',
      'l’altération ;',
      'la divulgation accidentelle ;',
      'les cyberattaques.',
    ],
    callout: {
      title: 'Mesures mises en œuvre',
      text: 'Chiffrement des communications (HTTPS/TLS), contrôle d’accès basé sur les rôles, authentification sécurisée, journalisation des accès, sauvegardes régulières, surveillance de l’infrastructure et mises à jour de sécurité.',
    },
  },
  {
    id: 'conservation',
    num: '10',
    title: 'Conservation des données',
    shortTitle: 'Conservation',
    paragraphs: [
      'Les données sont conservées uniquement pendant la durée nécessaire :',
    ],
    bullets: [
      'à la fourniture des services ;',
      'au respect des obligations légales ;',
      'à la résolution des litiges éventuels.',
    ],
    callout: {
      title: 'Fin de conservation',
      text: 'À l’expiration de cette durée, elles sont supprimées ou anonymisées.',
    },
  },
  {
    id: 'droits',
    num: '11',
    title: 'Droits des utilisateurs',
    shortTitle: 'Vos droits',
    paragraphs: [
      'Conformément au Code du numérique congolais, chaque utilisateur dispose notamment du droit :',
    ],
    bullets: [
      'd’accéder à ses données ;',
      'de demander leur rectification ;',
      'de demander leur suppression lorsque la loi le permet ;',
      'de retirer son consentement ;',
      'de s’opposer à certains traitements prévus par la loi ;',
      'd’introduire une réclamation auprès de l’autorité compétente lorsque celle-ci est instituée.',
    ],
  },
  {
    id: 'transferts',
    num: '12',
    title: 'Transferts internationaux',
    shortTitle: 'Transferts',
    paragraphs: [
      'Les données peuvent être hébergées ou traitées sur des infrastructures situées en dehors de la République démocratique du Congo lorsque cela est nécessaire au fonctionnement des services.',
      'Dans ce cas, Barua veille à ce que des garanties techniques, contractuelles et organisationnelles appropriées soient mises en œuvre afin d’assurer un niveau de protection conforme aux exigences du Code du numérique de la République démocratique du Congo.',
    ],
  },
  {
    id: 'cookies',
    num: '13',
    title: 'Cookies',
    paragraphs: [
      'Notre plateforme peut utiliser des cookies strictement nécessaires au fonctionnement du service.',
      'Les cookies non essentiels ne sont utilisés qu’avec le consentement de l’utilisateur lorsqu’il est requis.',
    ],
  },
  {
    id: 'echanges-admin',
    num: '14',
    title: 'Confidentialité des échanges avec les administrations',
    shortTitle: 'Échanges admin.',
    paragraphs: [
      'Lorsque l’utilisateur utilise Barua pour communiquer avec une administration ou un organisme partenaire :',
    ],
    bullets: [
      'Barua agit comme intermédiaire technique sécurisé ;',
      'seules les données nécessaires sont transmises ;',
      'les échanges sont protégés par des mécanismes de sécurité adaptés ;',
      'aucune donnée n’est réutilisée à des fins commerciales.',
    ],
  },
  {
    id: 'modifications',
    num: '15',
    title: 'Modification de cette politique',
    shortTitle: 'Modifications',
    paragraphs: [
      'Nous pouvons mettre à jour cette Politique de confidentialité afin de tenir compte de l’évolution de la législation, de nos services ou de nos mesures de sécurité.',
      'La version la plus récente est toujours disponible sur notre plateforme.',
    ],
  },
  {
    id: 'contact',
    num: '16',
    title: 'Contact',
    paragraphs: [
      'Pour toute question relative à la protection des données personnelles ou pour exercer vos droits, vous pouvez nous contacter au <a href="tel:+243900727272" class="text-brand font-semibold hover:underline">+243 900 727 272</a>.',
    ],
  },
]

let observer: IntersectionObserver | null = null

function onTocClick(id: string) {
  activeId.value = id
}

onMounted(() => {
  const els = sections
    .map(s => document.getElementById(s.id))
    .filter((el): el is HTMLElement => !!el)

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]?.target?.id) activeId.value = visible[0].target.id
    },
    { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
  )

  for (const el of els) observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.privacy-section + .privacy-section {
  border-top: 1px solid rgb(226 232 240 / 0.9);
  padding-top: 2.5rem;
}

details summary::-webkit-details-marker {
  display: none;
}
</style>

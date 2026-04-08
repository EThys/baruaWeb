<script setup lang="ts">
import { computed } from 'vue'
import primatureImg from '@/assets/primature.png'
import ministereImg from '@/assets/ministere.jfif'
import dgiImg from '@/assets/dgi.png'
import dgmImg from '@/assets/dgm.jfif'
import cnssImg from '@/assets/cnss.png'
import arptcImg from '@/assets/arptc.jfif'
import bccImg from '@/assets/bcc.png'

type Partner = {
  id: string
  sigle: string
  signification: string
  src: string
  removeBg: boolean
}

const partners: Partner[] = [
  {
    id: 'p1',
    sigle: 'Primature',
    signification: 'Secrétariat général du Gouvernement et coordination des politiques publiques',
    src: primatureImg,
    removeBg: false,
  },
  {
    id: 'p2',
    sigle: 'MI',
    signification: 'Ministère de l\'Intérieur, Sécurité, Décentralisation et Affaires coutumières',
    src: ministereImg,
    removeBg: true,
  },
  {
    id: 'p3',
    sigle: 'MSP',
    signification: 'Ministère de la Santé Publique, Hygiène et Prévention',
    src: ministereImg,
    removeBg: true,
  },
  {
    id: 'p4',
    sigle: 'DGI',
    signification: 'Direction Générale des Impôts',
    src: dgiImg,
    removeBg: false,
  },
  {
    id: 'p5',
    sigle: 'DGM',
    signification: 'Direction Générale des Migrations',
    src: dgmImg,
    removeBg: true,
  },
  {
    id: 'p6',
    sigle: 'CNSS',
    signification: 'Caisse Nationale de Sécurité Sociale',
    src: cnssImg,
    removeBg: false,
  },
  {
    id: 'p7',
    sigle: 'ARPTC',
    signification: 'Autorité de Régulation de la Poste et des Télécommunications du Congo',
    src: arptcImg,
    removeBg: true,
  },
  {
    id: 'p8',
    sigle: 'BCC',
    signification: 'Banque Centrale du Congo',
    src: bccImg,
    removeBg: false,
  },
]

const partnersLoop = computed(() => [...partners, ...partners])
</script>

<template>
  <section
    v-reveal="{ variant: 'fade', duration: 820 }"
    class="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/90 to-white border-y border-gray-100/80"
    aria-labelledby="partners-heading"
  >
    <div class="absolute inset-0 pointer-events-none opacity-[0.04] jacquard-bg" />
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[min(100vw,520px)] h-[min(100vw,520px)] rounded-full bg-brand/5 blur-[100px]" />

    <div class="page-container relative mb-10 sm:mb-12 text-center">
      <p class="text-brand text-xs font-bold uppercase tracking-[0.18em] mb-2">Partenariat institutionnel</p>
      <h2 id="partners-heading" class="font-display font-bold text-2xl sm:text-3xl text-gray-900">
        Ils nous soutiennent
      </h2>
      <p class="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
        Institutions et organismes de la République Démocratique du Congo engagés aux côtés de la plateforme.
      </p>
    </div>

    <!-- Piste de défilement : bords nets (masque) + léger relief encastré, sans bande de couleur qui « creuse » -->
    <div class="page-container relative">
      <div
        class="rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-b from-slate-100/80 via-white to-slate-50/90 p-1 sm:p-1.5 shadow-[0_8px_40px_-12px_rgba(13,71,161,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]"
      >
        <div
          class="flex h-1 w-full overflow-hidden rounded-t-[1.35rem] border-b border-slate-200/40"
          aria-hidden="true"
        >
          <div class="min-w-0 flex-1 bg-rdc-yellow" />
          <div class="min-w-0 flex-1 bg-rdc-blue" />
          <div class="min-w-0 flex-1 bg-rdc-red" />
        </div>
        <div
          class="relative overflow-hidden rounded-b-[1.35rem] bg-gradient-to-b from-white to-slate-50/70 px-3 py-8 sm:px-5 sm:py-10 shadow-[inset_0_2px_14px_rgba(13,71,161,0.05)]"
        >
          <div class="partner-marquee-viewport overflow-hidden">
            <div
              class="partner-marquee-track flex w-max gap-5 sm:gap-7 animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused] will-change-transform"
            >
          <article
            v-for="(p, i) in partnersLoop"
            :key="`${p.id}-${i}`"
            tabindex="0"
            class="group partner-logo-hit relative shrink-0 inline-block max-w-[220px] sm:max-w-[260px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            <img
              :src="p.src"
              :alt="`Logo ${p.sigle}`"
              width="260"
              height="120"
              :class="[
                'relative z-0 block h-[90px] sm:h-[100px] w-auto max-w-full object-contain rounded-2xl select-none transition-[transform,filter] duration-300 ease-out group-hover:scale-[0.96]',
                p.removeBg ? 'partner-logo-knockout partner-logo-drop-jfif' : 'partner-logo-drop',
              ]"
              loading="lazy"
              decoding="async"
              draggable="false"
            />

            <div
              class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl p-3 text-center opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-t from-brand-dark/[0.96] via-brand/[0.88] to-brand-light/80"
            >
              <p class="font-display font-bold text-white text-base sm:text-lg tracking-wide drop-shadow-sm">
                {{ p.sigle }}
              </p>
              <p class="mt-1.5 text-[10px] sm:text-[11px] text-blue-100/95 leading-relaxed line-clamp-5 max-h-[6.5rem] overflow-hidden">
                {{ p.signification }}
              </p>
            </div>
          </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Logos JFIF : atténuation du fond clair sur la piste (pas de carte derrière) */
.partner-logo-knockout {
  mix-blend-mode: multiply;
  isolation: isolate;
}

.partner-logo-knockout.partner-logo-drop-jfif {
  filter: contrast(1.08) saturate(1.06) drop-shadow(0 2px 10px rgba(13, 71, 161, 0.12))
    drop-shadow(0 1px 4px rgba(15, 23, 42, 0.07));
}

/* PNG : ombre portée sur le logo lui-même (silhouette de « carte ») */
.partner-logo-drop {
  filter: drop-shadow(0 2px 10px rgba(13, 71, 161, 0.14)) drop-shadow(0 1px 4px rgba(15, 23, 42, 0.07));
}

.partner-logo-hit:hover .partner-logo-drop,
.partner-logo-hit:focus-within .partner-logo-drop {
  filter: drop-shadow(0 6px 18px rgba(13, 71, 161, 0.22)) drop-shadow(0 2px 8px rgba(15, 23, 42, 0.09));
}

.partner-logo-hit:hover .partner-logo-drop-jfif,
.partner-logo-hit:focus-within .partner-logo-drop-jfif {
  filter: contrast(1.08) saturate(1.06) drop-shadow(0 6px 18px rgba(13, 71, 161, 0.2))
    drop-shadow(0 2px 8px rgba(15, 23, 42, 0.09));
}

/* Fondu sur les bords du scroll */
.partner-marquee-viewport {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 6%,
    #000 94%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 6%,
    #000 94%,
    transparent 100%
  );
}
</style>

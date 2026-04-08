<script setup lang="ts">
import { computed } from 'vue'
import adnImg from '@/assets/adn.jpeg'
import enaImg from '@/assets/ena.jpeg'
import fpImg from '@/assets/fonction publique.jpeg'
import dgmImg from '@/assets/dgm.jfif'
import dgiImg from '@/assets/dgi.png'
import cnssImg from '@/assets/cnss.png'
import arptcImg from '@/assets/arptc.jpeg'

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
    sigle: 'ADN',
    signification: 'Agence pour le Développement du Numérique',
    src: adnImg,
    removeBg: false,
  },
  {
    id: 'p2',
    sigle: 'ENA',
    signification: 'École Nationale d’Administration',
    src: enaImg,
    removeBg: false,
  },
  {
    id: 'p3',
    sigle: 'Fonction Publique',
    signification: 'Ministère de la Fonction Publique, Modernisation de l\'Administration et Innovation du Service Public',
    src: fpImg,
    removeBg: false,
  },
  {
    id: 'p4',
    sigle: 'DGM',
    signification: 'Direction Générale des Migrations',
    src: dgmImg,
    removeBg: true,
  },
  {
    id: 'p5',
    sigle: 'DGI',
    signification: 'Direction Générale des Impôts',
    src: dgiImg,
    removeBg: false,
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

    <div class="page-container relative mb-12 sm:mb-16 text-center">
      <div v-reveal="{ variant: 'up', duration: 600 }" class="inline-flex items-center gap-3 mb-4">
        <span class="h-px w-8 bg-brand/30"></span>
        <p class="text-brand text-xs font-extrabold uppercase tracking-[0.2em]">Partenariat institutionnel</p>
        <span class="h-px w-8 bg-brand/30"></span>
      </div>
      
      <h2 id="partners-heading" v-reveal="{ variant: 'up', duration: 700 }" class="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-tight">
        Ils nous <span class="text-brand">soutiennent</span>
      </h2>
      
      <p v-reveal="{ variant: 'up', duration: 800 }" class="text-gray-500 text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
        Les institutions et organismes de la <span class="text-gray-900 font-semibold">République Démocratique du Congo</span> engagés dans la transformation numérique de nos services publics.
      </p>
    </div>

    <!-- Marquee Viewport -->
    <div class="relative mt-8 sm:mt-12 overflow-hidden">
      <div class="partner-marquee-viewport overflow-hidden">
        <div
          class="partner-marquee-track flex w-max gap-12 sm:gap-20 animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused] items-center will-change-transform"
        >
          <div
            v-for="(p, i) in partnersLoop"
            :key="`${p.id}-${i}`"
            class="relative shrink-0 flex items-center justify-center min-w-[140px] sm:min-w-[180px]"
          >
            <img
              :src="p.src"
              :alt="`Logo ${p.sigle}`"
              :title="p.signification"
              class="block h-[100px] sm:h-[130px] w-auto max-w-full object-contain select-none transition-all duration-300 filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 hover:scale-110"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Handle logos with white backgrounds */
.partner-marquee-track img {
  mix-blend-mode: multiply;
  isolation: isolate;
}

/* Fondu sur les bords du scroll pour une transition douce */
.partner-marquee-viewport {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 10%,
    #000 90%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    #000 10%,
    #000 90%,
    transparent 100%
  );
}
</style>

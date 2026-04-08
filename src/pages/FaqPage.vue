<template>
  <div class="page-container py-12 max-w-3xl mx-auto">
    <div class="mb-10 text-center">
      <h1 class="font-display font-bold text-3xl text-gray-900 mb-2">Questions fréquentes</h1>
      <p class="text-gray-500">Tout ce que vous devez savoir sur la plateforme Barua.</p>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, i) in faqs"
        :key="i"
        class="card overflow-hidden"
      >
        <button
          @click="toggle(i)"
          class="w-full flex items-center justify-between p-5 text-left gap-4"
        >
          <span class="font-semibold text-gray-800 text-sm">{{ item.q }}</span>
          <ChevronDown
            :size="18"
            class="text-gray-400 flex-shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': open === i }"
          />
        </button>
        <div v-show="open === i" class="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {{ item.a }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const open = ref<number | null>(0)
function toggle(i: number) {
  open.value = open.value === i ? null : i
}

const faqs = [
  {
    q: 'Comment créer un compte citoyen ?',
    a: 'Cliquez sur "Créer mon compte" en haut de la page, renseignez vos informations (nom, prénom, email, téléphone et numéro CNI), puis validez votre email via le lien reçu.',
  },
  {
    q: 'Quels documents sont nécessaires pour effectuer une demande ?',
    a: 'Chaque service précise les pièces requises sur sa page de détail. En général : copie de la CNI ou du passeport, acte de naissance et justificatif de domicile.',
  },
  {
    q: 'Comment suivre l\'état de ma demande ?',
    a: 'Connectez-vous à votre espace citoyen, rendez-vous dans "Mes demandes". Chaque dossier affiche son statut en temps réel et son historique détaillé.',
  },
  {
    q: 'Les services en ligne sont-ils gratuits ?',
    a: 'La plateforme Barua est gratuite. Certaines démarches administratives restent soumises à des droits ou taxes fixés par la réglementation en vigueur.',
  },
  {
    q: 'Mes données personnelles sont-elles sécurisées ?',
    a: 'Oui. Toutes les transmissions sont chiffrées (TLS 1.3). Vos données sont hébergées sur des serveurs certifiés et régis par la loi nationale sur la protection des données.',
  },
  {
    q: 'Que faire si ma demande est rejetée ?',
    a: 'Le motif du rejet est précisé dans la notification. Vous pouvez corriger votre dossier et le soumettre à nouveau, ou contacter le service concerné pour obtenir de l\'aide.',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Rendez-vous dans votre espace, section "Aide", ou envoyez un email à support@barua.gouv. Notre équipe répond sous 24 heures les jours ouvrés.',
  },
]
</script>

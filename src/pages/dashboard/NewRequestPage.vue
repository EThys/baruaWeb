<template>
  <div class="max-w-3xl mx-auto pb-10">
    <button
      type="button"
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
    >
      <ArrowLeft :size="16" /> Retour
    </button>

    <div v-if="service">
      <!-- Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between gap-2 sm:gap-4">
          <template v-for="(s, i) in stepLabels" :key="s.key">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors"
                :class="step > i + 1
                  ? 'bg-emerald-600 text-white'
                  : step === i + 1
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-gray-200 text-gray-500'"
              >
                <Check v-if="step > i + 1" :size="18" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div class="min-w-0 hidden sm:block">
                <p class="text-xs font-semibold text-gray-900 truncate">{{ s.title }}</p>
                <p class="text-[11px] text-gray-500 truncate">{{ s.sub }}</p>
              </div>
            </div>
            <div
              v-if="i < stepLabels.length - 1"
              class="h-0.5 flex-1 max-w-[40px] sm:max-w-none bg-gray-200 rounded"
              :class="{ 'bg-brand/40': step > i + 1 }"
            />
          </template>
        </div>
        <p class="sm:hidden text-center text-xs text-gray-500 mt-3">{{ stepLabels[step - 1]?.title }}</p>
      </div>

      <div class="card p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute inset-0 jacquard-bg opacity-[0.04] pointer-events-none" />
        <div class="relative">
          <div class="flex items-start gap-3 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
              <FileText :size="22" class="text-gray-700" />
            </div>
            <div>
              <h1 class="font-display font-bold text-xl text-gray-900 leading-tight">{{ service.title }}</h1>
              <p class="text-xs text-gray-500 mt-0.5">{{ service.ministry }}</p>
            </div>
          </div>

          <!-- Step 1 -->
          <div v-show="step === 1" class="space-y-4">
            <h2 class="font-semibold text-gray-800">Vos coordonnées</h2>
            <div>
              <label class="label-text">Nom complet <span class="text-red-500">*</span></label>
              <input v-model="identity.fullName" type="text" class="input-field" autocomplete="name" />
              <p v-if="fieldErr('fullName')" class="form-error">{{ fieldErr('fullName') }}</p>
            </div>
            <div>
              <label class="label-text">Numéro d’identité (CNI / passeport) <span class="text-red-500">*</span></label>
              <input v-model="identity.nationalId" type="text" class="input-field" />
              <p v-if="fieldErr('nationalId')" class="form-error">{{ fieldErr('nationalId') }}</p>
            </div>
            <div>
              <label class="label-text">E-mail <span class="text-red-500">*</span></label>
              <input v-model="identity.email" type="email" class="input-field" autocomplete="email" />
              <p v-if="fieldErr('email')" class="form-error">{{ fieldErr('email') }}</p>
            </div>
            <div>
              <label class="label-text">Téléphone</label>
              <input v-model="identity.phone" type="tel" class="input-field" autocomplete="tel" placeholder="+243 …" />
              <p v-if="fieldErr('phone')" class="form-error">{{ fieldErr('phone') }}</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-show="step === 2" class="space-y-5">
            <h2 class="font-semibold text-gray-800">Informations du dossier</h2>
            <div v-for="field in service.formFields" :key="field.id">
              <label :for="field.id" class="label-text">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <p v-if="field.helpText" class="text-xs text-gray-400 mb-1.5">{{ field.helpText }}</p>

              <textarea
                v-if="field.type === 'textarea'"
                :id="field.id"
                v-model="(dossier[field.name] as string)"
                :placeholder="field.placeholder"
                :rows="field.rows ?? 3"
                class="input-field resize-none"
              />
              <select
                v-else-if="field.type === 'select'"
                :id="field.id"
                v-model="(dossier[field.name] as string)"
                class="input-field"
              >
                <option value="">-- Sélectionnez --</option>
                <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <div v-else-if="field.type === 'radio'" class="flex flex-wrap gap-3">
                <label
                  v-for="opt in field.options"
                  :key="opt.value"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium',
                    dossier[field.name] === opt.value
                      ? 'border-gray-800 bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  ]"
                >
                  <input v-model="(dossier[field.name] as string)" type="radio" :name="field.name" :value="opt.value" class="sr-only" />
                  {{ opt.label }}
                </label>
              </div>
              <div
                v-else-if="field.type === 'file'"
                class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors cursor-pointer"
              >
                <Upload :size="20" class="text-gray-300 mx-auto mb-2" />
                <p class="text-xs text-gray-500">Pièce jointe (étape suivante pour plusieurs fichiers)</p>
              </div>
              <input
                v-else
                :id="field.id"
                v-model="(dossier[field.name] as string)"
                :type="field.type === 'number' ? 'number' : field.type"
                :placeholder="field.placeholder"
                :min="field.min"
                :max="field.max"
                class="input-field"
              />
              <p v-if="fieldErr(field.name)" class="form-error">{{ fieldErr(field.name) }}</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-show="step === 3" class="space-y-4">
            <h2 class="font-semibold text-gray-800">Pièces jointes</h2>
            <p class="text-sm text-gray-600">Formats acceptés : PDF, images, Word — max recommandé 5 Mo.</p>
            <div class="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300 transition-colors">
              <Paperclip :size="24" class="text-gray-300 mx-auto mb-2" />
              <input id="wizard-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf" class="hidden" @change="handleFiles" />
              <label for="wizard-files" class="btn-outline btn-sm cursor-pointer inline-flex text-gray-700 border-gray-300 hover:bg-gray-50">
                Choisir des fichiers
              </label>
              <ul v-if="files.length" class="mt-4 space-y-1 text-left text-xs text-gray-600">
                <li v-for="f in files" :key="f.name" class="flex items-center gap-2">
                  <File :size="12" class="text-gray-500" /> {{ f.name }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Step 4 -->
          <div v-show="step === 4" class="space-y-4">
            <h2 class="font-semibold text-gray-800">Récapitulatif</h2>
            <div class="rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-sm space-y-2">
              <p><span class="text-gray-500">Demandeur :</span> {{ identity.fullName }}</p>
              <p><span class="text-gray-500">E-mail :</span> {{ identity.email }}</p>
              <p><span class="text-gray-500">Téléphone :</span> {{ identity.phone || '—' }}</p>
              <p><span class="text-gray-500">Identité :</span> {{ identity.nationalId }}</p>
              <p><span class="text-gray-500">Fichiers :</span> {{ files.length ? files.map(f => f.name).join(', ') : 'Aucun' }}</p>
            </div>
            <p class="text-xs text-gray-500">
              En soumettant, vous confirmez l’exactitude des informations fournies.
            </p>
          </div>

          <!-- Nav -->
          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              v-if="step > 1"
              type="button"
              class="btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="prev"
            >
              <ChevronLeft :size="16" /> Précédent
            </button>
            <div v-else />

            <div class="flex gap-2 justify-end">
              <button
                v-if="step < 4"
                type="button"
                class="btn-primary"
                @click="next"
              >
                Suivant <ChevronRight :size="16" />
              </button>
              <button
                v-else
                type="button"
                class="btn-primary"
                :disabled="submitting"
                @click="submit"
              >
                <Loader2 v-if="submitting" :size="18" class="animate-spin" />
                <Send v-else :size="18" />
                {{ submitting ? 'Envoi…' : 'Confirmer et soumettre' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card p-12 text-center text-gray-400">
      Service introuvable.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, File, FileText, Loader2, Paperclip, Send, Upload,
} from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import { useRequestsStore } from '@/stores/requests'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { identityStepSchema, buildServiceFormSchema } from '@/utils/formSchemas'

const route = useRoute()
const router = useRouter()
const svcStore = useServicesStore()
const reqStore = useRequestsStore()
const ui = useUIStore()
const auth = useAuthStore()

const service = computed(() => svcStore.getServiceById(route.params.serviceId as string))

const step = ref(1)
const submitting = ref(false)
const files = ref<File[]>([])
const stepErrors = ref<Record<string, string>>({})

const stepLabels = [
  { key: 'id', title: 'Coordonnées', sub: 'Identité' },
  { key: 'form', title: 'Dossier', sub: 'Formulaire' },
  { key: 'docs', title: 'Pièces', sub: 'Fichiers' },
  { key: 'recap', title: 'Validation', sub: 'Récap' },
]

const identity = reactive({
  fullName: auth.fullName || '',
  nationalId: auth.user?.nationalId || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
})

const dossier = reactive<Record<string, unknown>>({})

watch(
  () => service.value,
  s => {
    if (!s) return
    for (const f of s.formFields) {
      if (dossier[f.name] === undefined) {
        if (f.type === 'checkbox') dossier[f.name] = false
        else dossier[f.name] = ''
      }
    }
  },
  { immediate: true },
)

function fieldErr(name: string) {
  return stepErrors.value[name] ?? ''
}

function applyZodError(error: z.ZodError) {
  const next: Record<string, string> = {}
  const flat = error.flatten().fieldErrors
  for (const [k, v] of Object.entries(flat)) {
    if (v?.[0]) next[k] = v[0]
  }
  stepErrors.value = next
}

function next() {
  stepErrors.value = {}
  if (!service.value) return

  if (step.value === 1) {
    const r = identityStepSchema.safeParse(identity)
    if (!r.success) {
      applyZodError(r.error)
      return
    }
  }

  if (step.value === 2) {
    const schema = buildServiceFormSchema(service.value.formFields)
    const r = schema.safeParse(dossier)
    if (!r.success) {
      applyZodError(r.error)
      return
    }
  }

  if (step.value < 4) step.value += 1
}

function prev() {
  stepErrors.value = {}
  if (step.value > 1) step.value -= 1
}

function handleFiles(e: Event) {
  const input = e.target as HTMLInputElement
  files.value = Array.from(input.files ?? [])
}

async function submit() {
  if (!service.value || !auth.user) return

  const sdId = service.value.serviceDocumentaireId
  if (sdId == null) {
    ui.toast.error(
      'Service incomplet',
      'Ce service n’a pas d’identifiant documentaire. Choisissez une commune précise.',
    )
    return
  }

  submitting.value = true
  try {
    const commentaireParts = [
      ...Object.entries(dossier)
        .filter(([, v]) => v != null && String(v).trim() !== '')
        .map(([k, v]) => `${k}: ${String(v)}`),
    ]
    const newReq = await reqStore.submitDemandeProcuration(
      {
        serviceDocumentaireId: sdId,
        fullName: identity.fullName.trim(),
        numberIdentity: identity.nationalId.trim(),
        phone: identity.phone.trim() || undefined,
        commentaire: commentaireParts.length ? commentaireParts.join('\n') : undefined,
      },
      files.value,
      {
        serviceName: service.value.title,
        categorySlug: service.value.categorySlug,
        serviceId: service.value.id,
      },
    )
    ui.toast.success('Demande soumise !', `Référence : ${newReq.referenceNumber}`)
    router.push({ name: 'request-detail', params: { id: newReq.id } })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string; detailMessage?: string } } }
    ui.toast.error(
      'Échec de l’envoi',
      err.response?.data?.message
        ?? err.response?.data?.detailMessage
        ?? 'Impossible de créer la demande. Réessayez.',
    )
  } finally {
    submitting.value = false
  }
}
</script>

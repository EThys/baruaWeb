export function isCommuneOrganismType(typeName: string | undefined): boolean {
  return typeName?.trim().toLocaleLowerCase('fr') === 'commune'
}

/** Libellé lieu : « Maison communale de X (Ville) » si commune, sinon nom + ville. */
export function formatOrganismPlaceName(
  typeName: string | undefined,
  organismName: string | undefined,
  city: string | undefined,
): string {
  const name = organismName?.trim()
  const ville = city?.trim()

  if (isCommuneOrganismType(typeName) && name) {
    return ville ? `Maison communale de ${name} (${ville})` : `Maison communale de ${name}`
  }

  if (!name) return ville ?? ''
  return ville ? `${name} (${ville})` : name
}

/** Ligne complète pour badge (type — lieu), sauf commune = une seule phrase. */
export function formatOrganismFullLine(
  typeName: string | undefined,
  organismName: string | undefined,
  city: string | undefined,
): string {
  const place = formatOrganismPlaceName(typeName, organismName, city)
  if (isCommuneOrganismType(typeName)) return place
  const type = typeName?.trim()
  return type ? `${type} — ${place}` : place
}

/** Petit libellé au-dessus du nom (vide pour les communes). */
export function formatOrganismTypeCaption(typeName: string | undefined): string {
  if (isCommuneOrganismType(typeName)) return ''
  return typeName?.trim() || 'Organisme'
}

// Collapse IPA to the distinctions a listener (or a romanized query) reliably
// carries: drop length, tone-ish and dental marks, merge retroflex with dental,
// all nasals to n, schwa to a. Aspiration (ʰ) is kept — it's salient.
export function normalizeIPA(ipa: string): string {
  return ipa
    .replace(/ː/g, '')    // long vowels → short
    .replace(/͡/g, '')    // affricates: remove tie bar
    .replace(/̪/g, '')    // dental diacritic
    .replace(/ɦ/g, 'h')   // breathy h → plain h
    .replace(/ɾ/g, 'r')   // flap → r
    .replace(/ɽ/g, 'r')   // retroflex flap → r
    .replace(/ɪ/g, 'i')   // near-close → i
    .replace(/ʊ/g, 'u')   // near-close → u
    .replace(/ə/g, 'a')   // schwa → a
    .replace(/ɔ/g, 'o')   // open-mid → o
    .replace(/ɛ/g, 'e')   // open-mid front → e
    .replace(/ʋ/g, 'v')   // labiodental approximant → v
    .replace(/ŋ/g, 'n')   // velar nasal → n
    .replace(/ɲ/g, 'n')   // palatal nasal → n
    .replace(/ɳ/g, 'n')   // retroflex nasal → n
    .replace(/ɖ/g, 'd')   // retroflex d → d
    .replace(/ʈ/g, 't')   // retroflex t → t
    .replace(/ʃ/g, 'sh')
    .toLowerCase();
}

// Rough romanization → phonetic key, for matching a romanized query
// ("waheguru", "satnam") against stored phoneticKey values. Maps common
// English spelling conventions toward the normalized IPA alphabet. It is
// approximate by design: compare with a similarity measure (e.g. trigrams),
// not equality.
export function romanPhoneticKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/wh/g, 'v')       // wh → v  (waheguru → vaheguru)
    .replace(/w/g, 'v')        // w → v
    .replace(/ee/g, 'i')       // ee → i
    .replace(/oo/g, 'u')       // oo → u
    .replace(/aa/g, 'a')       // aa → a  (length is dropped in the key)
    .replace(/kh/g, 'kh')      // keep kh
    .replace(/gh/g, 'g')       // gh → g  (both map to g in the key)
    .replace(/dh/g, 'd')       // dh → d
    .replace(/th/g, 't')       // th → t
    .replace(/bh/g, 'b')       // bh → b
    .replace(/ph/g, 'p')       // ph → p  (pʰ → p in the key)
    .replace(/sh/g, 'sh')      // keep sh
    .replace(/ch/g, 'ch')      // keep ch
    .replace(/ng/g, 'n')       // ng → n
    .replace(/[^a-z]/g, '');   // strip anything non-alpha
}

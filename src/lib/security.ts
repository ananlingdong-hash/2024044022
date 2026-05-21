const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function deriveKey(secret: string) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode("ai-stock-platform"), iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function encryptApiKey(plain: string, passphrase: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase)
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plain))
  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  })
}

export async function decryptApiKey(payload: string, passphrase: string) {
  const parsed = JSON.parse(payload) as { iv: number[]; data: number[] }
  const key = await deriveKey(passphrase)
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(parsed.iv) },
    key,
    new Uint8Array(parsed.data),
  )
  return decoder.decode(decrypted)
}

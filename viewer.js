'use strict';
(async () => {
  const message = document.getElementById('message');
  const encodedKey = new URLSearchParams(location.hash.slice(1)).get('key');
  if (!encodedKey || !/^[A-Za-z0-9_-]{43}$/.test(encodedKey)) {
    message.textContent = 'Open the complete link shared with you to view this walkthrough.';
    return;
  }
  try {
    const rawKey = Uint8Array.from(atob(encodedKey.replace(/-/g, '+').replace(/_/g, '/') + '='), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
    const response = await fetch('document.enc', {credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'});
    if (!response.ok) throw new Error('Unavailable');
    const encrypted = new Uint8Array(await response.arrayBuffer());
    const plain = await crypto.subtle.decrypt({name: 'AES-GCM', iv: encrypted.slice(0, 12)}, key, encrypted.slice(12));
    const frame = document.getElementById('document');
    frame.srcdoc = new TextDecoder('utf-8', {fatal: true}).decode(plain);
    frame.hidden = false;
    document.getElementById('status').hidden = true;
  } catch {
    message.textContent = 'This link could not open the walkthrough. Check that you have the complete, current link.';
  }
})();

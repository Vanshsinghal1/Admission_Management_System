// src/utils/loadPayPal.js
export function loadPayPal(clientId, currency = "USD") {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      return resolve(window.paypal);
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error("PayPal SDK failed to load."));
      }
    };
    script.onerror = (err) => reject(err);

    document.body.appendChild(script);
  });
}

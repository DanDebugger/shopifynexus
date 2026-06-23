document.addEventListener("DOMContentLoaded", () => {
  console.log("Nexus Build App Embed Initialized");

  // Since we don't know the exact class names of the storefront buttons, 
  // we will listen globally for any click on a button that contains the word "Build" 
  // inside the nexus-build-selector section.
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.nexus-build-selector button, .nexus-build-selector a.button');
    
    if (btn && btn.textContent.toLowerCase().includes('build')) {
      e.preventDefault();
      
      // We will hardcode the seeded 'template-pro-gamer' ID for the demo since the theme 
      // might not have dynamic template IDs mapped yet.
      const templateId = "template-pro-gamer";
      const originalText = btn.textContent;
      
      try {
        btn.textContent = "Submitting...";
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';

        // POST to App Proxy
        // App Proxy is configured as: prefix="apps", subpath="nexus", url=".../api/proxy"
        // Target Route: /apps/nexus/builds -> backend: /api/proxy/builds
        const response = await fetch('/apps/nexus/builds', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            // Shopify App proxy requires no-cors or standard fetch, x-www-form handles best
          },
          body: new URLSearchParams({ 
            templateId: templateId,
            customerId: "web-" + Math.random().toString(36).substring(7)
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          btn.textContent = "Build Sent to Dashboard!";
          btn.style.backgroundColor = "green";
          btn.style.color = "white";
          alert("Success! Your PC Build Request (ID: " + result.buildId + ") has been sent to our tech team.");
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("NexusLab App Proxy Error:", err);
        btn.textContent = "Error Submitting";
        btn.style.backgroundColor = "red";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.backgroundColor = "";
        }, 3000);
      }
    }
  });
});

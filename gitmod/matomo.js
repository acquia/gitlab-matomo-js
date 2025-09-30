addGainsight();

var isAcquian = false

var checkRequiredElementsExist = () => {
    if (typeof window.gl !== 'undefined' && document.readyState == "complete" && document.querySelectorAll('[data-project]').length) {
        observe('.table-holder', element => {
            element.addEventListener('click', hideThings)
        });
        hideThings();
        gainsightIdentify();
    }
    clearInterval(checkInterval);
}

var checkInterval = setInterval(() => Promise.resolve(fetch('/api/v4/user'))
.then(response => {
  return response.json()
})
.then(usr => { 
     const emailSplit = usr.email?.split('@')[1]
     if (emailSplit === "acquia.com") {
         isAcquian = true
     }
})
.then(() =>{
  checkRequiredElementsExist();
}), 100); 

/**
 * Add logic to hide the webide and edit options from Code Studio UI
 *
 */ 
function hideThings () {
  // Hide Web IDE specific elements using multiple targeting strategies
  
  // Strategy 1: Target common Web IDE selectors
  const webIdeSelectors = [
    'a[href*="ide"]',
    'button[title*="Web IDE"]',
    '[data-qa-selector*="web_ide"]',
    '.js-web-ide-button',
    '[aria-label*="Web IDE"]',
    // Additional selectors for edit dropdown menus
    'a[data-track-action="click_edit_ide"]',
    '[data-track-label*="web_ide"]',
    '.btn[href*="ide"]'
  ];
  
  webIdeSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element.textContent.includes('Web IDE') || 
          element.title?.includes('Web IDE') || 
          element.getAttribute('aria-label')?.includes('Web IDE') ||
          element.href?.includes('ide') ||
          element.getAttribute('data-track-action')?.includes('ide')) {
        element.setAttribute('style', 'display:none !important');
      }
    });
  });
  
  // Strategy 2: Handle dropdown menu items containing Web IDE (VERY specific matching)
  const webIdeMenuItems = document.evaluate("//li[.//text()[text()='Web IDE'] or .//text()[text()='Open in Web IDE']]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let index = 0; index < webIdeMenuItems.snapshotLength; index++) {
    const menuItem = webIdeMenuItems.snapshotItem(index);
    if (menuItem) {
      const text = menuItem.textContent.trim();
      // ONLY hide if it's exactly "Web IDE" or "Open in Web IDE", nothing else
      if ((text === 'Web IDE' || text === 'Open in Web IDE') && 
          !text.includes('Visual Studio Code') && 
          !text.includes('IntelliJ') &&
          !text.includes('Edit in pipeline editor')) {
        menuItem.setAttribute('style', 'display:none !important');
      }
    }
  }
  
  // Strategy 3: Target EXACT text patterns for Web IDE only
  const webIdeTextPatterns = [
    "//span[text()='Web IDE']",
    "//span[text()='Open in Web IDE']", 
    "//a[text()='Web IDE']",
    "//a[text()='Open in Web IDE']",
    "//button[text()='Web IDE']"
  ];
  
  webIdeTextPatterns.forEach(pattern => {
    const elements = document.evaluate(pattern, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let index = 0; index < elements.snapshotLength; index++) {
      const element = elements.snapshotItem(index);
      if (element) {
        // Find the appropriate parent container to hide
        const parentToHide = element.closest('li, a, button, .dropdown-item, [role="menuitem"]');
        if (parentToHide) {
          const parentText = parentToHide.textContent.trim();
          // Double-check we're not hiding legitimate options
          if ((parentText === 'Web IDE' || parentText === 'Open in Web IDE') &&
              !parentText.includes('Visual Studio Code') && 
              !parentText.includes('IntelliJ') &&
              !parentText.includes('Edit in pipeline editor')) {
            parentToHide.setAttribute('style', 'display:none !important');
          }
        }
      }
    }
  });
  
  // Strategy 4: Handle Edit dropdown containers specifically 
  // This targets GitLab's current DOM structure with data-testid attributes
  const editDropdowns = document.querySelectorAll('[data-testid="edit-dropdown-toggle"], button[aria-label*="Edit"], [data-toggle="dropdown"]');
  editDropdowns.forEach(dropdown => {
    if (dropdown.textContent.includes('Edit') || dropdown.getAttribute('data-testid') === 'edit-dropdown-toggle') {
      // Look for Web IDE options in various dropdown menu patterns
      const possibleMenus = [
        dropdown.nextElementSibling,
        dropdown.parentElement?.querySelector('.dropdown-menu'),
        dropdown.parentElement?.querySelector('.gl-dropdown-menu'), 
        dropdown.parentElement?.querySelector('[data-testid*="dropdown"]'),
        dropdown.parentElement?.querySelector('ul[role="menu"]'),
        // Sometimes the menu is a sibling of the parent
        dropdown.parentElement?.nextElementSibling
      ];
      
      possibleMenus.forEach(dropdownMenu => {
        if (dropdownMenu) {
          const webIdeItems = dropdownMenu.querySelectorAll('a, li, [role="menuitem"], button');
          webIdeItems.forEach(item => {
            if ((item.textContent.includes('Web IDE') || item.textContent.includes('Open in Web IDE')) && 
                !item.textContent.includes('Edit in pipeline editor')) {
              item.setAttribute('style', 'display:none !important');
            }
          });
        }
      });
    }
  });
  
  // Strategy 5: Use MutationObserver to catch dynamically loaded dropdown content
  // ONLY target Web IDE specifically, preserve all other options
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Use setTimeout to ensure the dropdown is fully rendered
          setTimeout(() => {
            // Very specific Web IDE targeting - only exact matches
            const webIdeSelectors = [
              'a[href*="/-/ide/"]', // GitLab Web IDE URLs
              'button[data-track-label="web_ide"]',
              '[data-qa-selector*="web_ide"]'
            ];
            
            webIdeSelectors.forEach(selector => {
              const elements = node.querySelectorAll ? node.querySelectorAll(selector) : [];
              elements.forEach(element => {
                element.setAttribute('style', 'display:none !important');
              });
            });
            
            // Text-based matching - be VERY specific
            const allItems = node.querySelectorAll ? node.querySelectorAll('a, li, [role="menuitem"], button') : [];
            allItems.forEach(item => {
              if (item.textContent && item.textContent.trim()) {
                const text = item.textContent.trim();
                // ONLY hide exact "Web IDE" matches, nothing else
                if ((text === 'Web IDE' || text === 'Open in Web IDE') && 
                    !text.includes('Visual Studio Code') && 
                    !text.includes('IntelliJ') && 
                    !text.includes('Edit in pipeline editor') && 
                    !text.includes('Edit single file')) {
                  item.setAttribute('style', 'display:none !important');
                }
              }
            });
          }, 10);
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });

  // Hide Operator section from left panel
  if ((operateLink = document.querySelector('[data-qa-section-name="Operate"]'))) {
    operateLink.setAttribute('style', 'display:none !important')
  }
  // Hide Monitor section from left panel
  if ((monitorLink = document.querySelector('[data-qa-section-name="Monitor"]'))) {
    monitorLink.setAttribute('style', 'display:none !important')
  }
  // Hide 'Add Kubernetes cluster' section from project page
  if ((k8sLink = document.evaluate(
        "//a[contains(.,'Add Kubernetes cluster')]", document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue)
  ) {
    k8sLink.setAttribute('style', 'display:none !important');
  }
}

function addGainsight () {
  var gainsight_api_keys = {
    // Prod.
    'code.acquia.com': 'AP-IJB0Z39VSYPZ-2',
    // Dev.
    'code.dev.cloudservices.acquia.io': 'AP-IJB0Z39VSYPZ-2-2',
    // QA.
    'code.qa.cloudservices.acquia.io': 'AP-IJB0Z39VSYPZ-2-2',
    // Stage.
    'code-staging.cloudservices.acquia.io': 'AP-IJB0Z39VSYPZ-2-3'
  }
  if (location.hostname in gainsight_api_keys) {
    var gainsight_key = gainsight_api_keys[location.hostname];
  } else {
    // Default api key is the prod one.
    var gainsight_key = 'AP-IJB0Z39VSYPZ-2';
  }
  (function(n,t,a,e,co){var i="aptrinsic";n[i]=n[i]||function(){
        (n[i].q=n[i].q||[]).push(arguments)},n[i].p=e;n[i].c=co;
        var r=t.createElement("script");r.async=!0,r.src=a+"?a="+e;
        var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(r,c)
    })(window,document,"https://web-sdk.aptrinsic.com/api/aptrinsic.js",gainsight_key);
}

function gainsightIdentify() {
   aptrinsic("identify", { "id": document.querySelectorAll('[data-project]')[0].getAttribute('data-project'),
                            "isAcquian": isAcquian } );
}

// Ensuring call of function 'hideThings' after entire page loads properly, to avoid race conditions
window.addEventListener("load", afterLoaded, false);

function afterLoaded() {
  // Additional wait for 500 milli seconds
  const additionalWait = setTimeout(hideThings, 200);
}

function queryElements(selector, callback) {

  const elements = document.querySelectorAll(selector);
  elements.forEach(element => callback(element));
}

function observe(selector, callback) {
  // Call it once to get all the elements already on the page
  queryElements(selector, callback);

  const observer = new MutationObserver(() => {
    queryElements(selector, callback);
  });

  observer.observe(document.documentElement, {
    // Listen to any kind of changes that might match the selector
    attributes: true,
    childList: true,
  });
}


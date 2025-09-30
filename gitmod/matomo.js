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
  // Debug: Log that hideThings is running
  console.log('hideThings: Starting execution');
  
  // Hide Web IDE specific elements using multiple targeting strategies
  
  // Strategy 1: Direct text search for "Web IDE" in all elements
  const allElements = document.querySelectorAll('*');
  console.log('hideThings: Checking', allElements.length, 'elements for Web IDE text');
  
  let hiddenCount = 0;
  allElements.forEach(element => {
    if (element.textContent && element.children.length === 0) { // Text nodes only, no children
      const text = element.textContent.trim();
      if (text === 'Web IDE' || text === 'Open in Web IDE') {
        console.log('hideThings: Found Web IDE text element:', element, 'Text:', text);
        const parentToHide = element.closest('li, a, button, [role="menuitem"]');
        if (parentToHide) {
          parentToHide.setAttribute('style', 'display:none !important');
          hiddenCount++;
          console.log('hideThings: Hidden parent element:', parentToHide);
        } else {
          element.setAttribute('style', 'display:none !important');
          hiddenCount++;
          console.log('hideThings: Hidden element directly:', element);
        }
      }
    }
  });
  
  console.log('hideThings: Hidden', hiddenCount, 'Web IDE elements');
  
  // Also try common selectors
  const webIdeSelectors = [
    'a[href*="/-/ide/"]',
    'button[title*="Web IDE"]',
    '[data-qa-selector*="web_ide"]',
    '.js-web-ide-button',
    '[aria-label*="Web IDE"]',
    'a[data-track-action="click_edit_ide"]',
    '[data-track-label*="web_ide"]'
  ];
  
  webIdeSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log('hideThings: Selector', selector, 'found', elements.length, 'elements');
    elements.forEach(element => {
      element.setAttribute('style', 'display:none !important');
      console.log('hideThings: Hidden via selector:', element);
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
  const observer = new MutationObserver((mutations) => {
    console.log('hideThings: MutationObserver triggered with', mutations.length, 'mutations');
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          console.log('hideThings: Processing added node:', node);
          
          // Use setTimeout to ensure the dropdown is fully rendered
          setTimeout(() => {
            // Search for Web IDE text in the new node
            if (node.querySelectorAll) {
              const allItems = node.querySelectorAll('*');
              console.log('hideThings: Checking', allItems.length, 'new elements for Web IDE text');
              
              allItems.forEach(item => {
                if (item.textContent && item.children.length === 0) { // Text nodes only
                  const text = item.textContent.trim();
                  if (text === 'Web IDE' || text === 'Open in Web IDE') {
                    console.log('hideThings: MutationObserver found Web IDE:', item, 'Text:', text);
                    const parentToHide = item.closest('li, a, button, [role="menuitem"]');
                    if (parentToHide) {
                      parentToHide.setAttribute('style', 'display:none !important');
                      console.log('hideThings: MutationObserver hidden parent:', parentToHide);
                    } else {
                      item.setAttribute('style', 'display:none !important');
                      console.log('hideThings: MutationObserver hidden item directly:', item);
                    }
                  }
                }
              });
            }
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


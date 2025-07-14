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
  // Fetch the document that contains 'Web IDE' text
  var webIde = document.evaluate("//span[contains(., 'Web IDE') or contains(., 'Open in Web IDE')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
  
  for (let index = 0; index < webIde.snapshotLength; index++) {
    var content = webIde.snapshotItem(index);
    if(webIde != null && webIde != null){
    
      // The style is applied on multiple lists available to edit the files
      if (content.textContent.startsWith('Web IDE')){
        content.closest("li").setAttribute('style', 'display:none !important');
      } else {
        // The style is applied on when there is one option available to edit through web ide
        content.parentNode.closest(".gl-new-dropdown").setAttribute('style', 'display:none !important');
      }
    }
  }

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


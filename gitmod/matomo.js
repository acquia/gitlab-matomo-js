addGainsight();
var checkRequiredElementsExist = setInterval(function () {
    if (window.gl !== 'undefined' && document.readyState == "complete" && document.querySelectorAll('[data-project]').length) {
      clearInterval(checkRequiredElementsExist);
      hideThings();
      gainsightIdentify();
    }
  }, 100);

var oldURL = window.location.href;
setInterval(checkURLchange, 1000);

/**
 * Check if there is change in URL. If the change observed invoke hideThings();
 *
 */ 
function checkURLchange(){
  if(window.location.href != oldURL){
      oldURL = window.location.href;
      hideThings();
  }
}

/**
 * Add logic to hide the webide and edit options from Code Studio UI
 *
 */ 
function hideThings () {
  // Fetch the document that contains 'Web IDE' text
  var webIde = document.evaluate("//span[contains(., 'Web IDE')]", document, null, XPathResult.ANY_TYPE, null );
  var webIdeDoc = webIde.iterateNext();
  // Assign the document to webIdeDiv
  var webIdeDiv = webIdeDoc;
  var content;
  var hasText;
  // Iterate to get the parent node of the webIdeDiv, length is set to 10 as the currently
  // it takes 9 iterations to get the parent div where we want to apply style
  for (let index = 1; index < 10; index++) {
    content = webIdeDiv.textContent || webIdeDiv.innerText;
    // extra check
    hasText = content.toLowerCase().includes("edit");
    // Add checks to verify if the correct parent div is taken
    if (((webIdeDiv.classList.contains("gl-new-dropdown")) && (webIdeDiv.classList.contains("gl-display-block!")) && hasText)) {
      // As there are 2 places for webide, and dropdown length differs for both the places
      // for multipe list, style is applied on list
      if(webIdeDiv.querySelectorAll("li").length > 2){
        var closeseList=webIdeDoc.closest("li");
        closeseList.setAttribute('style', 'display:none !important');
      }
      webIdeDiv.setAttribute('style', 'display:none !important');
    } else {
      webIdeDiv = webIdeDiv.parentNode
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
   aptrinsic("identify", { "id": document.querySelectorAll('[data-project]')[0].getAttribute('data-project') } );
}
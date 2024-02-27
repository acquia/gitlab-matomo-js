addGainsight();
window.addEventListener("load", function(){
  var checkRequiredElementsExist = setInterval(function () {
    if (window.gl !== 'undefined' && document.readyState == "complete" && document.querySelectorAll('[data-project]').length) {
      clearInterval(checkRequiredElementsExist);
      hideThings();
      gainsightIdentify();
    }
  }, 100);
})

function hideThings () {

  var webIde = document.evaluate("//span[contains(., 'Web IDE')]", document, null, XPathResult.ANY_TYPE, null );
  var webIdeDoc = webIde.iterateNext();
  
  var webIdeDiv = webIdeDoc;
  var content;
  var hasText;
  for (let index = 1; index < 10; index++) {
    console.log("index  ", index)
    console.log("webIdeDoc 1", webIdeDiv)
    content = webIdeDiv.textContent || webIdeDiv.innerText;
    hasText = content.toLowerCase().includes("edit");
    console.log("hasText 1", hasText)
  
    if (((webIdeDiv.classList.contains("gl-new-dropdown")) && (webIdeDiv.classList.contains("gl-display-block!")) && hasText)) {
      if(webIdeDiv.querySelectorAll("li").length > 2){
        var closeseList=webIdeDoc.closest("li");
        console.log("closeseList 1", closeseList)
        closeseList.setAttribute('style', 'display:none !important');
      }
      console.log("webIdeDiv 1", webIdeDiv)
      webIdeDiv.setAttribute('style', 'display:none !important');
      console.log("webIdeDiv 2", webIdeDiv)
    } else {
      console.log("webIdeDiv 4", webIdeDiv)
      webIdeDiv = webIdeDiv.parentNode
      console.log("webIdeDiv 5", webIdeDiv)
    }
  }

  var webIdeButton = document.querySelector('[data-qa-selector="action_dropdown"]')
  if(webIdeButton){
    webIdeButton.setAttribute('style', 'display:none !important')
  }
  var editWebButton = document.querySelector('[data-qa-selector="webide_menu_item"]')
  if (editWebButton) {
    editWebButton.setAttribute('style', 'display:none !important')
  }
  if ((operateLink = document.querySelector('[data-qa-section-name="Operate"]'))) {
    operateLink.setAttribute('style', 'display:none !important')
  }
  if ((monitorLink = document.querySelector('[data-qa-section-name="Monitor"]'))) {
    monitorLink.setAttribute('style', 'display:none !important')
  }
  if ((k8sLink = document.evaluate(
        "//a[contains(text(),'Add Kubernetes cluster')]", document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue)
  ) {
    k8sLink.style.display = 'none';
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
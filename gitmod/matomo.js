addGainsight();
var checkRequiredElementsExist = setInterval(function () {
  if (window.gl !== 'undefined' && document.readyState == "complete" && document.querySelectorAll('[data-project]').length) {
    clearInterval(checkRequiredElementsExist);
    hideThings();
    gainsightIdentify();
  }
}, 100);

function hideThings () {
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
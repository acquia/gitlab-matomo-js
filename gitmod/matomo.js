addGainsight();
var checkRequiredElementsExist = setInterval(function () {
  if (window.gl !== 'undefined' && document.querySelectorAll('[data-user]').length) {
    clearInterval(checkRequiredElementsExist);
    hideThings();
    gainsightIdentify();
  }
}, 100);

function hideThings () {
  if ((webIdeButton = document.querySelector('[data-qa-selector="action_dropdown"]'))) {
    webIdeButton.style.display = 'none';
  }
  if ((editIdeButton = document.querySelector('[data-track-action="click_edit_ide"]'))) {
    editIdeButton.style.display = 'none';
  }
  if ((infrastructureLink = document.querySelector('[data-track-label="infrastructure_menu"]'))) {
    infrastructureLink.style.display = 'none';
  }
  if ((monitorLink = document.querySelector('[data-track-label="monitor_menu"]'))) {
    monitorLink.style.display = 'none';
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
    'code.acquia.com': 'XXXXXXXXXX',
    // Dev.
    'code.dev.cloudservices.acquia.io': 'XXXXXXXXXX',
    // Stage.
    'code-staging.cloudservices.acquia.io': 'XXXXXXXXXX'
  }
  if (location.hostname in gainsight_api_keys) {
    var gainsight_key = gainsight_api_keys[location.hostname];
  } else {
    // Default api key is the prod one.
    var gainsight_key = 'XXXXXXXXXX';
  }
  (function(n,t,a,e,co){var i="aptrinsic";n[i]=n[i]||function(){
        (n[i].q=n[i].q||[]).push(arguments)},n[i].p=e;n[i].c=co;
        var r=t.createElement("script");r.async=!0,r.src=a+"?a="+e;
        var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(r,c)
    })(window,document,"https://web-sdk.aptrinsic.com/api/aptrinsic.js",gainsight_key);
}

function gainsightIdentify() {
   aptrinsic("identify", { "id": document.querySelectorAll('[data-user]')[0].getAttribute('data-user') } );
}
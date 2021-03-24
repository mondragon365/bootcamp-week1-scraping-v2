let btnscrap = document.getElementById("btnscrap");
let btnscrapAll = document.getElementById("btnscrapAll");
let profilesUrlArr = [];
let profilesData = [];

chrome.runtime.onMessage.addListener(async function (request) {
  var [currentTab] = await chrome.tabs.query({active: true,currentWindow: true});
  if (request.action == "next") {
    profilesData.push(request.data);

    profilesUrlArr.shift();

    if (profilesUrlArr.length > 0) {
      updateProperties = new Object();
      updateProperties.url = profilesUrlArr[0];
      chrome.tabs.update(currentTab.id, updateProperties, function () {});

      await chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        info,
        tabb
      ) {
        if (info.status === "complete" && tabId === tabb.id) {
          return;
        }
      });
    }else{
      chrome.tabs.goBack(currentTab.id);   
      await chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        info,
        tabb
        ) {
          if (info.status === "complete" && tabId === tabb.id) {
          var port = chrome.tabs.connect(currentTab.id);
          port.postMessage({ action: "showData" ,data:profilesData});
        }
      });
    }
  }
});



btnscrap.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  var port = chrome.tabs.connect(tab.id);
  port.postMessage({ action: "scraping" });
});

btnscrapAll.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  var port = chrome.tabs.connect(tab.id);
  port.postMessage({ action: "scan" });

  port.onMessage.addListener(async function (response) {
    if (response.action == "storeProfiles") {
      profilesUrlArr = response.profiles;

      updateProperties = new Object();
      updateProperties.url = response.profiles[0];
      chrome.tabs.update(tab.id, updateProperties, function () {});

      await chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        info,
        tabb
      ) {
        if (info.status === "complete" && tabId === tabb.id) {
          return;
        }
      });
    }
  });
});

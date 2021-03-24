const wait = function (milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
};

const createPopup = () => {
    const styleDiv =
      "position: fixed;z-index: 2000;width:100%; top: 0px;left: 0px;overflow: visible;display: flex;align-items: flex-end;background-color: lightgray;font-size: 10px;padding: 10px;";
    const stylePre =
      "position: relative;max-height: 400px;overflow: scroll;width: 100%;";
    const div = document.createElement("div");
    div.id = "krowdy-message";
    div.style = styleDiv;

    const pre = document.createElement("pre");
    pre.id = "krowdy-pre";
    pre.style = stylePre;

    const button = document.createElement("button");

    button.id = "krowdy-button";
    button.style = "background: gray;border: 2px solid;padding: 8px;";
    button.innerText = "Aceptar";

    const bodyElement = document.querySelector("body");

    bodyElement.appendChild(div);

    pre.innerText = "Estamos extrayendo la información!!!!";
    div.appendChild(pre);
    div.appendChild(button);
    return { div, pre, button };
  };

  const autoscrollToElement = async function (cssSelector) {
    var exists = document.querySelector(cssSelector);

    while (exists) {
      //
      let maxScrollTop = document.body.clientHeight - window.innerHeight;
      let elementScrollTop = document.querySelector(cssSelector).offsetHeight;
      let currentScrollTop = window.scrollY;

      if (
        maxScrollTop == currentScrollTop ||
        elementScrollTop <= currentScrollTop
      )
        break;

      await wait(32);

      let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop);
      window.scrollTo(0, newScrollTop);
    }

    console.log("finish autoscroll to element %s", cssSelector);

    return new Promise(function (resolve) {
      resolve();
    });
  };

const scrapingProfile = async () => {
  //Logic
  const selectorProfile = {
    personalInformation: {
      name: "div.ph5.pb5 > div.display-flex.mt2 ul li",
      title: "div.ph5.pb5 > div.display-flex.mt2 h2",
      resume: "section.pv-about-section > p",
    },
    experienceInformation: {
      list: "#experience-section > ul > li",
      groupByCompany: {
        identify: ".pv-entity__position-group",
        company: "div.pv-entity__company-summary-info > h3 > span:nth-child(2)",
        list: "section > ul > li",
        title: "div > div > div > div > div > div > h3 > span:nth-child(2)",
        date:
          "div > div > div > div > div > div > div > h4 > span:nth-child(2)",
        description: ".pv-entity__description",
      },
      default: {
        title: "section > div > div > a > div.pv-entity__summary-info > h3",
        company:
          "section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title",
        date:
          "section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)",
        description: "section > div > div > div > p",
      },
    },
    educationInformation: {
      list: "#education-section > ul > li",
      institution: "div > div > a > div.pv-entity__summary-info > div > h3",
      career:
        "div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)",
      date:
        "div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)",
    },
  };

  const clickOnMoreResume = async () => {
    const elementMoreResume = document.getElementById(
      "line-clamp-show-more-button"
    );
    if (elementMoreResume) elementMoreResume.click();
  };

  const getPersonalInformation = async () => {
    const { personalInformation: selector } = selectorProfile;
    const elementNameProfile = document.querySelector(selector.name);
    const elementNameTitle = document.querySelector(selector.title);
    const elementResume = document.querySelector(selector.resume);

    const name = elementNameProfile?.innerText;
    const title = elementNameTitle?.innerText;
    const resume = elementResume?.innerText;
    return { name, title, resume };
  };

  const getExperienceInformation = async () => {
    const { experienceInformation: selector } = selectorProfile;
    //get information
    let experiencesRawList = document.querySelectorAll(selector.list);
    let experiencesRawArray = Array.from(experiencesRawList);

    const groupCompaniesList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length > 0;
    });

    const uniqueExperienceList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length == 0;
    });

    const experiences = uniqueExperienceList.map((el) => {
      const title = el.querySelector(selector.default.title)?.innerText;
      const date = el.querySelector(selector.default.date)?.innerText;
      const company = el.querySelector(selector.default.company)?.innerText;
      const description = el.querySelector(selector.default.description)
        ?.innerText;

      return { title, date, company, description };
    });

    for (let i = 0; i < groupCompaniesList.length; i++) {
      const item = groupCompaniesList[i];
      const company = item.querySelector(selector.groupByCompany.company)
        ?.innerText;
      const itemsCompanyGroupList = item.querySelectorAll(
        selector.groupByCompany.list
      );
      const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList);

      const experiencesData = itemsCompanyGroupArray.map((el) => {
        const title = el.querySelector(selector.groupByCompany.title)
          ?.innerText;
        const date = el.querySelector(selector.groupByCompany.date)?.innerText;
        const description = el.querySelector(
          selector.groupByCompany.description
        )?.innerText;

        return { title, date, company, description };
      });

      experiences.push(...experiencesData);
    }

    return experiences;
  };

  const getEducationInformation = async () => {
    const { educationInformation: selector } = selectorProfile;
    const educationItems = document.querySelectorAll(selector.list);
    const educationArray = Array.from(educationItems);
    const educations = educationArray.map((el) => {
      const institution = el.querySelector(selector.institution)?.innerText;
      const career = el.querySelector(selector.career)?.innerText;
      const date = el.querySelector(selector.date)?.innerText;
      return { institution, career, date };
    });
    return educations;
  };

  

  //Scroll to all information
  const { div, pre, button } = createPopup();

  pre.innerText = "Scaneando el perfil";
  await autoscrollToElement("body");
  await clickOnMoreResume();

  //Scraping Complete Profile
  const personalInformation = await getPersonalInformation();
  const experienceInformation = await getExperienceInformation();
  const educationInformation = await getEducationInformation();

  pre.innerText = "Ya tenemos las información del perfil";
  await wait(1000);

  //Setting data to send information
  const profile = {
    ...personalInformation,
    experiences: experienceInformation,
    educations: educationInformation,
  };
  pre.innerText = JSON.stringify(profile, null, 2);

  button.addEventListener("click", () => {
    //Necesito el fetch

    div.remove();
  });
  return profile;
};

const showProfilesData = async (data) => {

    const { div, pre, button } = createPopup();  
    await autoscrollToElement("body");    
    pre.innerText = JSON.stringify(data, null, 2);
    button.addEventListener("click", () => {
      //Necesito el fetch
      div.remove();
    });
  };

const scrapingProfiles = async () => {
  const profilesArray = Array.from(
    document.querySelectorAll(
      "ul.reusable-search__entity-results-list > li.reusable-search__result-container"
    )
  );

  const profilesList = profilesArray.map((profileItem) => {
    return profileItem.querySelector("a").href;
  });
  return profilesList;
};

//Comunication

window.onload = async function () {  
  if (window.location.href.includes("/in/")) {
    wait(3000).then(async () => {
      profile = await scrapingProfile();
      chrome.runtime.sendMessage({
        action: "next",
        url: window.location.href,
        data: profile,
      });
    });
  }
};

(function () {
  chrome.runtime.onConnect.addListener(async function (port) {
    port.onMessage.addListener(async function (msg) {
      var { action,data } = msg;

      if (action == "scan") {
        var lista = await scrapingProfiles();
        port.postMessage({ action: "storeProfiles", profiles: lista });
      }
      if (action == "showData") {
          await showProfilesData(data);
      }
      
    });
  });
})();

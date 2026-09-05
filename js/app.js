/* =====================================================
   APP / NAVIGATION
===================================================== */

function isAdmin(){
  return currentProfile?.role === "admin";
}

const pages = [
  "homePage",
  "urzadPage",
  "myTaxesPage",
  "myLicensesPage",
  "myFeesPage",
  "myPropertiesPage",
  "mySalariesPage",
  "taxRulesPage",
  "courtPage",
  "adminPage"
];

function hideAllPages(){
  pages.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.classList.add("hidden");
  });
}

function goHome(){
  hideAllPages();
  document.getElementById("homePage")?.classList.remove("hidden");
  renderHomeProfile();
}

function openMyTaxes(){
  hideAllPages();
  document.getElementById("myTaxesPage")?.classList.remove("hidden");
  loadMyTaxes();
}

function openMyLicenses(){
  hideAllPages();
  document.getElementById("myLicensesPage")?.classList.remove("hidden");
  loadMyLicenses();
}

function openMyFees(){
  hideAllPages();
  document.getElementById("myFeesPage")?.classList.remove("hidden");
  loadMyFees();
}

function openMyProperties(){
  hideAllPages();
  document.getElementById("myPropertiesPage")?.classList.remove("hidden");
  loadMyProperties();
}

function openMySalaries(){
  hideAllPages();
  document.getElementById("mySalariesPage")?.classList.remove("hidden");
  loadMySalaries();
}

function openTaxRules(){
  hideAllPages();
  document.getElementById("taxRulesPage")?.classList.remove("hidden");
  loadDefinitions();
}

function openCourt(){
  hideAllPages();
  document.getElementById("courtPage")?.classList.remove("hidden");
  loadCourtPublic();
}

function openAdmin(){
  if(!isAdmin()) return;

  hideAllPages();
  document.getElementById("adminPage")?.classList.remove("hidden");

  loadAdminData();
}


/* =====================================================
   INIT
===================================================== */

async function init(){

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if(session){
    currentUser = session.user;

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    currentProfile = profile;

    showApp();
  }else{
    showLogin();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {

    if(session){
      currentUser = session.user;

      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      currentProfile = profile;

      showApp();
    }else{
      currentUser = null;
      currentProfile = null;

      showLogin();
    }

  });
}

init();

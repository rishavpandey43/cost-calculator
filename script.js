const currencyLocalMap = {
  INR: "en-IN",
  USD: "en-US",
};

const currencyFormat = ({
  amount,
  currency,
  fixedBy = 2,
  locale = navigator.language,
}) => {
  let formattedCurrency = "-";
  try {
    if (amount || amount === 0) {
      amount = Number(amount).toFixed(fixedBy);
      const splittedValue = String(amount).split(".");
      formattedCurrency = `${currency ? currency + " " : ""}${Intl.NumberFormat(
        currencyLocalMap[currency] || locale
      ).format(splittedValue[0])}.${splittedValue[1]}`;
    }
  } catch (e) {}
  return formattedCurrency;
};

default currencyFormat;
const toggleList = () => {};

const createList = (list = [], id = "country-list") => {
  const element = document.getElementById(id);
  element.innerHTML = null;
  var frag = document.createDocumentFragment();
  for (let j = 0; j < list.length; j++) {
    const option = document.createElement("li");
    const item = list[j];
    option.dataset.value = item.value;
    option.innerText = item.label;
    option.classList.add("list-items");
    frag.appendChild(option);
  }
  element.appendChild(frag);
};

const filterList = (list = [], text = "", id) => {
  const filteredList = list.filter((item) =>
    item.label.toLowerCase().includes(text?.toLowerCase())
  );
  createList(filteredList, id);
};

const createTaxList = (data = [], id) => {
  const accordian = document.getElementById(id);

  if (!accordian) return;

  if (!data.length) {
    const hideClass = "esti-tax-container";
    accordian.classList.add(hideClass);
    const accordianParent = accordian.parentElement;
    const prev = accordianParent.querySelector(".accordian-root");
    prev.classList.add(hideClass);
    return;
  }

  const frag = document.createDocumentFragment();
  const ulClass = `d-flex-new justify-content-space-between mt-2 acc-item-container`;
  for (let index = 0; index < data.length; index++) {
    const dataItem = data[index];
    const ul = document.createElement("ul");
    ul.classList = ulClass;
    const firstLI = document.createElement("li");
    firstLI.innerHTML = dataItem[0];
    const secondLI = document.createElement("li");
    secondLI.innerHTML = dataItem[1];
    ul.appendChild(firstLI);
    ul.appendChild(secondLI);
    frag.appendChild(ul);
  }
  accordian.innerHTML = "";
  accordian.append(frag);
};

// ****************************

const currencyList = [
  { label: "United States Dollar - USD", value: "USD" },
  { label: "British Pound Sterling - GBP", value: "GBP" },
  { label: "Euro - EUR", value: "EUR" },
];

const url =
  "https://storage.googleapis.com/skuad-public-assets/cc-country-list.json";
const fetchCountryData = async (url) => {
  let response = await fetch(url);
  const newVar = await response.json();
  return newVar.countryList;
};

const countryList = await fetchCountryData(url);
createList(currencyList, "currency-list");

const endpoint =
  "https://global-knowledge-base-dot-skuad-core-prod.el.r.appspot.com/api/cost-calculator/cost?countryCode=:countryCode&currencyCode=:currencyCode&salary=:salary";

const form = document.getElementById("form");
const countryInput = document.getElementById("country-input");
const currencyInput = document.getElementById("currency-input");
const currencyListEl = document.getElementById("currency-list");
const countryListEl = document.getElementById("country-list");
const grossSalaryInput = document.getElementById("gross-salary-input");
const empAcc = document.getElementById("emp-accordian-container");
const empAccord = document.getElementById("accordian-emp-container");

const toggleClass = (key) => {
  const activeEls = document.querySelectorAll(".active");
  activeEls.forEach((el) => el.classList.remove("active"));
  const el = document.getElementById(key);
  el.classList.add("active");
};

let comData = null;
const salaryData = (key = "monthly") => {
  const resData = comData[key];

  toggleClass(key);
  if (!resData) return;

  const totalEmploymentCost = resData.totalEmploymentCost;

  const grossMonthlySalEmp = resData.grossSalary;
  const skuadFee = resData.skuadFee;
  const netSalary = resData.totalEmployeeSalary;
  const currencyFor = comData.currencyCode;

  document.getElementById("curr-type").innerHTML = comData.currencyCode;
  document.getElementById("emp-cost").innerHTML = currencyFormat({
    amount: totalEmploymentCost,
  });

  document.getElementById("gross-monthly-sal").innerHTML = currencyFormat({
    amount: grossMonthlySalEmp,
    currency: currencyFor,
  });

  document.getElementById("gross-monthly-sal-emp").innerHTML = currencyFormat({
    amount: grossMonthlySalEmp,
    currency: currencyFor,
  });
  document.getElementById("skuad-fee").innerHTML = currencyFormat({
    amount: skuadFee,
    currency: currencyFor,
  });
  document.getElementById("curreny-type").innerHTML = comData.currencyCode;
  document.getElementById("net-salary").innerHTML = currencyFormat({
    amount: netSalary,
  });

  const innerEmployerData = resData.employerEstTaxBreakup;
  const innerEmployeeData = resData.employeeEstTaxBreakup;

  createTaxList(innerEmployerData, "employer-est-tx-container");

  createTaxList(innerEmployeeData, "emp-est-tx-container");
};

const _handleSubmit = async (e) => {
  e.preventDefault();

  document.getElementById("calculate-salary").innerText = "Calculating...";
  document.getElementById("calculate-salary").setAttribute("disabled", "");

  const countryCd = countryList.find(
    (country) => country.label === countryInput.value
  );

  const currencyCd = currencyList.find(
    (curr) => curr.label === currencyInput.value
  );

  const data = await fetch(
    endpoint
      .replace(":countryCode", countryCd.value)
      .replace(":salary", grossSalaryInput.value)
      .replace(":currencyCode", currencyCd.value)
  );

  data
    .json()
    .then((res) => {
      comData = res.data;

      salaryData();
      document.getElementById("calculate-salary").removeAttribute("disabled");
      document.getElementById("calculate-salary").innerText = "Calculate";
    })
    .catch((err) => {
      document.getElementById("calculate-salary").removeAttribute("disabled");
      document.getElementById("calculate-salary").innerText = "Calculate";
    });

  function showModalHandler() {
    document.getElementById("show-calculator-modal").style.display = "block";
  }

  showModalHandler();
};

form.onsubmit = _handleSubmit;

const yearly = document.querySelector(".toggle-btn-wrapper");
const yearlyCalculation = (e) => {
  salaryData(e.target.innerText.toLowerCase());
};
yearly.addEventListener("click", yearlyCalculation);

const toggleAccordian = () => {
  empAcc.classList.toggle("expand");
};

empAcc.addEventListener("click", toggleAccordian);

const toggleAccordianEmp = (e) => {
  empAccord.classList.toggle("expand");
};

empAccord.addEventListener("click", toggleAccordianEmp);

/**country start here  */
const toggleCountryList = (e) => {
  e.stopPropagation();
  const text = e.target.value || "";

  countryListEl.classList.toggle("list-modal");
  currencyListEl.classList.add("list-modal");
  filterList(countryList, text, "country-list");
};

countryInput.addEventListener("click", toggleCountryList);

countryInput.addEventListener("blur", (e) => {
  const text = e.target.value;
  const isEqual = countryList.find(
    (item) => item.label.toLowerCase() === text.toLowerCase()
  );
  if (!isEqual) countryInput.value = "";
});

const countryListElOnClick = (e) => {
  e.preventDefault();

  countryInput.value = e.target.innerText;

  toggleCountryList(e);
};

countryListEl.addEventListener("click", countryListElOnClick);

countryInput.addEventListener("input", (e) => {
  const text = e.target.value;
  filterList(countryList, text, "country-list");
});

/**country end here */

/**currency start here  */

const toggleCurrencyList = (e) => {
  e.stopPropagation();
  const text = e.target.value || "";
  currencyListEl.classList.toggle("list-modal");
  countryListEl.classList.add("list-modal");
  filterList(currencyList, text, "currency-list");
};

currencyInput.addEventListener("click", toggleCurrencyList);

currencyInput.addEventListener("blur", (e) => {
  const text = e.target.value;
  const isEqual = currencyList.find(
    (item) => item.label.toLowerCase() === text.toLowerCase()
  );
  if (!isEqual) currencyInput.value = "";
});

const CurrencyListElOnClick = (e) => {
  currencyInput.value = e.target.innerText;
  toggleCurrencyList(e);
};

currencyListEl.addEventListener("click", CurrencyListElOnClick);

currencyInput.addEventListener("input", (e) => {
  const text = e.target.value;
  filterList(currencyList, text, "currency-list");
});

/**currency end here */

document.body.addEventListener("click", () => {
  const els = document.querySelectorAll(".list-cotainer");
  els.forEach((el) => el.classList.add("list-modal"));
});

/* aroowdown and up key country select key  */
countryInput.addEventListener("keydown", (e) => {
  const keyName = e.key;
  const activeEl = countryListEl.querySelector(".active");

  if (keyName === "ArrowDown") {
    const firstChildEle = countryListEl.firstChild;
    if (!activeEl) {
      firstChildEle.classList.add("active");
    } else {
      const nextEl = activeEl.nextSibling;
      activeEl.classList.remove("active");
      nextEl.classList.add("active");
    }
    activeEl.scrollIntoView({
      block: "center",
    });
  } else if (keyName === "ArrowUp") {
    const lastChildEle = countryListEl.lastChild;
    if (!activeEl) {
      lastChildEle.classList.add("active");
    } else {
      const nextEl = activeEl.previousSibling;
      activeEl.classList.remove("active");
      nextEl.classList.add("active");
    }
    activeEl.scrollIntoView({
      block: "center",
    });
  } else if (keyName === "Enter") {
    e.preventDefault();
    countryInput.value = activeEl.innerText;
    countryListEl.classList.add("list-modal");
  }
});

/* aroowdown and up key currency select key  */

currencyInput.addEventListener("keydown", (e) => {
  const keyName = e.key;
  const activeEl = currencyListEl.querySelector(".active");
  if (keyName === "ArrowDown") {
    const firstChildEle = currencyListEl.firstChild;
    if (!activeEl) {
      firstChildEle.classList.add("active");
    } else {
      const nextEl = activeEl.nextSibling;
      activeEl.classList.remove("active");
      nextEl.classList.add("active");
    }
    activeEl.scrollIntoView({
      block: "center",
    });
  } else if (keyName === "ArrowUp") {
    const lastChildEle = currencyListEl.lastChild;
    if (!activeEl) {
      lastChildEle.classList.add("active");
    } else {
      const nextEl = activeEl.previousSibling;
      activeEl.classList.remove("active");
      nextEl.classList.add("active");
    }
    activeEl.scrollIntoView({
      block: "center",
    });
  } else if (keyName === "Enter") {
    e.preventDefault();
    currencyInput.value = activeEl.innerText;
    currencyListEl.classList.add("list-modal");
  }
});

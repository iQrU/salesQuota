'use strict';

const selector = document.querySelectorAll('.district');
selector[0].setAttribute("class", "selected");
const checkbox = document.getElementById("checkbox");
let firstGrade, token, productCodes, donutTitle, trayWidth = document.documentElement.clientWidth;
let productData = {}, terrSum = {};
const productCodeSet = { B04XEL: "RA portfolio", CIBXELXEU: "JAK portfolio", CIBB04XELXEU: "I&I Brands", XELXEU: "TOFA-Brand", BAVBESIBRINLLOR185VIZE60: "Oncology", CRE006388: "Antifungal", B37229: "Antibiotics" };

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    const dataArray = processCsv(this.responseText);
    let dist = selector[0].innerHTML;
    const data = summerizeData(dataArray, "Dist", "Terr", "제품");
    const terrData = summerizeData(dataArray, "Terr", "제품");
    const teamProduct = {
      CORE2: ["ELIQUIS", "CIBINQO", "XELJANZ", "XELJANZ 10", "ENBREL"],
      CORE1: ["BAVENCIO", "BESPONSA", "CRESEMBA", "ERAXIS", "IBRANCE", "INLYTA", "LORVIQUA", "PRECEDEX", "SUTENE", "TYGACIL", "VFEND", "VIZIMPRO", "XALKORI", "ZYVOX"],
      CORE3: ["PREVENAR13(A)", "PREVENAR13(P)"],
      CORE4: ["BAVENCIO", "BESPONSA", "CRESEMBA", "ELIQUIS", "ENBREL", "ERAXIS", "IBRANCE", "INLYTA", "PRECEDEX", "SUTENE", "TYGACIL", "VFEND", "VIZIMPRO", "XALKORI", "XELJANZ", "ZYVOX"]
    };
    const palette = { BAVENCIO: "#2759AF", BESPONSA: "#88CCA2", CIBINQO: "#0047BC", CRESEMBA: "#95368E", ELIQUIS: "#77014D", ENBREL: "#73CAC1", ERAXIS: "#1B92D4", IBRANCE: "#3E3092", INLYTA: "#DD007B", LORVIQUA: "#F5A400", PRECEDEX: "#3A3A59", "PREVENAR13(A)": "#00305E", "PREVENAR13(P)": "#E83A5F", SUTENE: "#C70850", TYGACIL: "#F08326", VFEND: "#006555", VIZIMPRO: "#E61587", XALKORI: "#00A6CA", XELJANZ: "#525C52", "XELJANZ 10": "#354544", ZYVOX: "#BB2429" };
    const rainbow = ["red", "orange", "yellowgreen", "green", "skyblue", "blue", "purple", "violet", "pink", "brown", "gray"];
    let width = document.documentElement.clientWidth;
    firstGrade = function () {
      dist = token;
      showClicSel(dist);
      const checkContainer = document.querySelector(`.checkbox`);
      checkContainer.setAttribute("class", "checkbox");
      makeBarChart(data[dist], teamProduct[dist], width, width * 0.5, document.body, palette, "2023 PRODUCT BUDGET");
    }
    productCodes = pairProductCode(dataArray, "제품", "mpg");

    let distSum = {}, total = 0;
    for (let i = 0; i < selector.length; i++) {
      const district = selector[i].innerText;
      distSum[district] = 0;
      for (let territory in data[district]) {
        for (let product in data[district][territory]) {
          distSum[district] += data[district][territory][product][12];
        }
      }
      total += distSum[district];

      selector[i].addEventListener("click", function () {
        const checkbox = document.querySelector(`.checkbox`);
        checkbox.setAttribute("class", "checkbox");
        for (let j = 0; j < selector.length; j++) {
          selector[j].removeAttribute("class", "selected");
        }
        selector[i].setAttribute("class", "selected");
        const chart = document.getElementById("chart");
        chart ? chart.remove() : null;
        const allProductDiv = document.getElementById("subMenuDiv");
        allProductDiv ? allProductDiv.remove() : null;
        dist = selector[i].innerText;
        token = dist;
        makeBarChart(data[dist], teamProduct[dist], width, width * 0.5, document.body, palette, "2023 PRODUCT BUDGET");
        tag.innerHTML = "ratio";
      });
    }

    let diameterArray = [];
    for (let i = 0; i < selector.length; i++) {
      const district = selector[i].innerText;
      const amount = distSum[district];
      const shareRoot = Math.sqrt(amount / total);
      diameterArray.push([shareRoot, amount]);
    }

    const checkContainer = document.querySelector(`.checkbox`);
    checkContainer.setAttribute("class", "checkbox hidden");
    throwCoverBalls(diameterArray, data, teamProduct, palette);

    checkbox.onchange = function () {
      const chart = document.getElementById("chart");
      chart.remove();
      token.length == 8 ?
        makeLineChart(terrData[token], Object.keys(terrData[token]), width, width * 0.5, document.body, palette, token + " PRODUCT BUDGET") :
        makeBarChart(data[dist], teamProduct[dist], width, width * 0.5, document.body, palette, "2023 PRODUCT BUDGET");
    }

    window.addEventListener("resize", function () {
      width = document.documentElement.clientWidth, trayWidth = width;
      const chart = document.getElementById("chart");
      chart.remove();
      Object.keys(productCodes).indexOf(token) != -1 ?
        bakeDonut(productData, Object.keys(data[dist]).sort(), width, width * 0.5, document.body, rainbow, donutTitle) :
        token == "emptyDonut" ?
          bakeDonut(terrSum, Object.keys(data[dist]).sort(), width, width * 0.5, document.body, rainbow, donutTitle) :
          token == "coverPage" ?
            throwCoverBalls(diameterArray) :
            token.length == 8 ?
              makeLineChart(terrData[token], Object.keys(terrData[token]), width, width * 0.5, document.body, palette, token + " PRODUCT BUDGET") :
              makeBarChart(data[dist], teamProduct[dist], width, width * 0.5, document.body, palette, "2023 PRODUCT BUDGET");
    });
  }
}
xhr.open("GET", "/data/quotaSetting2023.csv", false);
xhr.send();

function processCsv(csvText) {
  let dataArray = [];
  const lines = csvText.split(/\r\n|\r|\n/);
  function replacer(matchString) {
    return matchString.replace(/[" ,]/g, "");
  }
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.replace(/"\s?\d+[0-9, ]*"/g, replacer).replace(/,\s?-/, ",0").split(",");
    dataArray.push(line);
  }
  return dataArray;
}

function summerizeData(dataArray, criteria1, criteria2, criteria3) {
  let summeryObj = {};
  const header = dataArray[23];
  const idx1 = header.indexOf(criteria1);
  const idx2 = header.indexOf(criteria2);
  const idx3 = header.indexOf(criteria3);
  for (let i = 24; i < dataArray.length; i++) {
    const item1 = dataArray[i][idx1];
    const item2 = dataArray[i][idx2];
    const item3 = dataArray[i][idx3];
    if (summeryObj[item1]) {
      if (criteria2) {
        if (summeryObj[item1][item2]) {
          if (criteria3) {
            if (summeryObj[item1][item2][item3]) {
              summeryObj[item1][item2][item3] = dataArray[i].slice(6).map((x, y) => x * 1 + summeryObj[item1][item2][item3][y]);
            } else {
              summeryObj[item1][item2][item3] = dataArray[i].slice(6).map(x => x * 1);
            }
          } else {
            summeryObj[item1][item2] = dataArray[i].slice(6).map((x, y) => x * 1 + summeryObj[item1][item2][y]);
          }
        } else if (criteria3) {
          summeryObj[item1][item2] = {};
          summeryObj[item1][item2][item3] = dataArray[i].slice(6).map(x => x * 1);
        } else {
          summeryObj[item1][item2] = dataArray[i].slice(6).map(x => x * 1);
        }
      } else {
        summeryObj[item1] = dataArray[i].slice(6).map((x, y) => x * 1 + summeryObj[item1][y]);
      }
    } else {
      if (criteria2) {
        if (criteria3) {
          summeryObj[item1] = {};
          summeryObj[item1][item2] = {};
          summeryObj[item1][item2][item3] = dataArray[i].slice(6).map(x => x * 1);
        } else {
          summeryObj[item1] = {};
          summeryObj[item1][item2] = dataArray[i].slice(6).map(x => x * 1);
        }
      } else {
        summeryObj[item1] = dataArray[i].slice(6).map(x => x * 1);
      }
    }
  }
  return summeryObj;
}

function throwCoverBalls(diameterArray) {
  const menuBar = document.getElementById("menuBar");
  menuBar.style.display = "none";
  //const checkbox = document.querySelector(`.checkbox`);
  //checkbox.setAttribute("class", "checkbox hidden");
  token = "coverPage";

  const ballCount = diameterArray.length;
  const rowCount = Math.round(window.matchMedia('(orientation: portrait)').matches ? Math.sqrt(ballCount * 3) / 2 : Math.sqrt(ballCount / 3) * 2);
  let positionArray = [], max = 0, stackX = 0, stackY = 0;

  for (let i = 0; i < ballCount; i++) {
    let x = 0, y = 0;
    if (i % rowCount != 0) {
      x = positionArray[i - 1][0] + diameterArray[i - 1][0];
    } else {
      let sum = 0;
      for (let j = 0; j < rowCount; j++) {
        sum += diameterArray[i + j][0];
      }
      sum > max ? max = sum : null;
    }
    const lineSeq = Math.floor(i / rowCount);
    i % 2 == 1 && lineSeq == 0 ? y = diameterArray[i - 1][0] / 4 : null;
    if (lineSeq != 0) {
      y = positionArray[i - rowCount][1] + diameterArray[i - rowCount][0];
    }
    positionArray.push([x, y]);
  }

  const ratio = trayWidth / max / (window.matchMedia('(orientation: portrait)').matches ? 1 : 1.6);
  const basicFont = trayWidth * 0.01;
  const ballBox = document.createElement("div");
  ballBox.setAttribute("id", "chart");
  document.body.appendChild(ballBox);

  for (let i = 0; i < positionArray.length; i++) {
    const diameter = diameterArray[i][0] * ratio;
    const ballDiv = document.createElement("div");
    const dist = selector[i].innerText;
    ballDiv.setAttribute("class", "ballDiv");
    ballDiv.setAttribute("style", `width:${diameter}px; height:${diameter}px; --w:${basicFont * 1.5}px; --x:${positionArray[i][0] * ratio}px; --y:${positionArray[i][1] * ratio}px; --z:${Math.random() * 3 + 7}s`);
    ballDiv.innerHTML = `${dist}:<br>₩${diameterArray[i][1].toLocaleString()}<br>(${(Math.pow(diameterArray[i][0], 2) * 100).toFixed(1)}%)`;

    ballDiv.addEventListener("click", function () {
      ballBox.remove();
      menuBar.style.display = "block";
      token = dist;
      firstGrade();
      console.log(token);
    });
    ballBox.appendChild(ballDiv);
  }

}

function showClicSel(dist) {
  let distArray = [];
  for (let i = 0; i < selector.length; i++) {
    selector[i].removeAttribute("class", "selected");
    distArray.push(selector[i].innerText);
  }
  const distIdx = distArray.indexOf(dist);
  selector[distIdx].setAttribute("class", "selected");
}

function pairProductCode(dataArray, productColumn, codeColumn) {
  let pairing = {};
  const header = dataArray[0];
  const productIdx = header.indexOf(productColumn);
  const codeIdx = header.indexOf(codeColumn);
  for (let i = 1; i < 22; i++) {
    const product = dataArray[i][productIdx];
    const code = dataArray[i][codeIdx]
    pairing[product] = code;
  }
  return pairing;
}

function makeBarChart(data, legendSet, width, height, parentDiv, palette, title) {

  const chartArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chartArea.setAttribute("width", width), chartArea.setAttribute("height", height), chartArea.setAttribute("id", "chart");
  parentDiv.appendChild(chartArea);

  const banner = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const basicFont = width * 0.01;
  const titleFont = basicFont * 2.5;
  const titleWidth = title.length * titleFont * 3 / 5;
  banner.setAttribute("x", (width - titleWidth) / 2);
  banner.setAttribute("y", chartArea.height.baseVal.value / 20);
  banner.setAttribute("font-size", titleFont), banner.setAttribute("font-style", "italic"), banner.setAttribute("fill", "indigo");
  banner.innerHTML = title;
  chartArea.appendChild(banner);

  let max = 0;
  terrSum = {}
  for (let i in data) {
    let subtotal = 0;
    for (let j in data[i]) {
      const item = data[i][j];
      subtotal += item[item.length - 1];
    }
    max = subtotal > max ? subtotal : max;
    terrSum[i] = subtotal;
  }
  let unitNum = Math.pow(10, Math.floor(Math.log10(max)));
  max / unitNum < 2 ? unitNum = unitNum / 4 : max / unitNum < 5 ? unitNum = unitNum / 2 : null;
  const unitCipher = Math.floor(Math.log10(unitNum * 5));
  const unit = Math.pow(10, unitCipher - (unitCipher % 3 == 0 ? 3 : unitCipher % 3));

  const axisWidth = width * 0.05;
  if (checkbox.checked) {
    for (let i = 0; i < 6; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const vPosition = height * 0.87 - height * 0.15 * i;
      line.setAttribute("x1", width * 0.04), line.setAttribute("x2", width * 0.99);
      line.setAttribute("y1", vPosition), line.setAttribute("y2", vPosition);
      line.setAttribute("stroke", i == 0 ? "black" : "purple"), line.setAttribute("stroke-width", 0.3);
      chartArea.appendChild(line);

      const axisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const axisVal = (20 * i) + "%";
      const cipherWidth = basicFont * (axisVal.length + 1);
      axisLabel.setAttribute("x", axisWidth * 0.7 - cipherWidth * 0.6), axisLabel.setAttribute("y", vPosition + height * 0.008);
      axisLabel.setAttribute("font-size", basicFont), axisLabel.setAttribute("font-style", "italic");
      axisLabel.innerHTML = `${axisVal.toLocaleString()}`;
      chartArea.appendChild(axisLabel);
    }
  } else {
    let unitPosition = 0;
    for (let i = 0; i <= max / unitNum; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const vPosition = height * 0.87 - unitNum * i / max * height * 0.8;
      i + 1 > max / unitNum ? unitPosition = vPosition - height * 0.045 : null;
      line.setAttribute("x1", width * 0.04), line.setAttribute("x2", width * 0.99);
      line.setAttribute("y1", vPosition), line.setAttribute("y2", vPosition);
      line.setAttribute("stroke", i == 0 ? "black" : "purple"), line.setAttribute("stroke-width", 0.3);
      chartArea.appendChild(line);

      const axisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const axisVal = unitNum / unit * i;
      const cipherWidth = axisVal != 0 ? basicFont * ((Math.floor(Math.log10(axisVal)) + 1) + Math.floor(Math.floor(Math.log10(axisVal)) / 3) / 3) : basicFont;
      axisLabel.setAttribute("x", axisWidth * 0.7 - cipherWidth * 0.6), axisLabel.setAttribute("y", vPosition + height * 0.008);
      axisLabel.setAttribute("font-size", basicFont), axisLabel.setAttribute("font-style", "italic");
      axisLabel.innerHTML = `${axisVal.toLocaleString()}`;
      chartArea.appendChild(axisLabel);
    }
    const unitSign = document.createElementNS("http://www.w3.org/2000/svg", "text");
    unitSign.setAttribute("x", 0), unitSign.setAttribute("y", unitPosition);
    unitSign.innerHTML = `*unit: ${Math.log10(unit) == 6 ? "mil." : Math.log10(unit) == 9 ? "bil." : "??"}`;
    unitSign.setAttribute("font-size", basicFont), unitSign.setAttribute("font-style", "italic"), unitSign.setAttribute("fill", "blue");
    chartArea.appendChild(unitSign);
  }

  let positionX, positionY, medianX;
  const dataKeys = Object.keys(data).sort();
  const barWidth = chartArea.width.baseVal.value / (dataKeys.length + 2) * 0.7;
  const signWidth = basicFont * 1.2 * 8 * 3 / 5;
  for (let i = 0; i < dataKeys.length; i++) {
    positionX = width / dataKeys.length * 0.97 * i + axisWidth;
    medianX = positionX + barWidth / 2;
    const panel = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    panel.setAttribute("x", medianX - signWidth * 0.6), panel.setAttribute("width", signWidth * 1.2);
    panel.setAttribute("y", height * 0.88), panel.setAttribute("height", signWidth * 0.35);
    panel.setAttribute("rx", basicFont / 3), panel.setAttribute("ry", basicFont / 3);
    panel.setAttribute("fill", "#5b0eeb");
    chartArea.appendChild(panel);

    const dataKey = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dataKey.setAttribute("x", medianX - signWidth / 2), dataKey.setAttribute("y", height * 0.908);
    dataKey.setAttribute("font-size", basicFont * 1.2), dataKey.setAttribute("fill", "white");
    dataKey.setAttribute("class", "terr");
    const territory = dataKeys[i];
    dataKey.innerHTML = territory;
    chartArea.appendChild(dataKey);
    dataKey.onclick = function () {
      token = territory;
      const chart = document.getElementById("chart");
      chart.remove();

      const allTerrDiv = document.createElement("div");
      allTerrDiv.setAttribute("id", "subMenuDiv");
      document.body.appendChild(allTerrDiv);
      for (let j = 0; j < dataKeys.length; j++) {
        const terr = dataKeys[j];
        const terrBox = document.createElement("div");
        terrBox.setAttribute("class", "subItem");
        i == j ? terrBox.classList.toggle('terrActive') : null;
        terrBox.innerHTML = terr;
        allTerrDiv.appendChild(terrBox);

        terrBox.onclick = function () {
          token = terr;
          const chart = document.getElementById("chart");
          chart.remove();

          const subItems = document.querySelectorAll(`.subItem`);
          for (let k = 0; k < subItems.length; k++) {
            const subItem = subItems[k];
            subItem.setAttribute("class", "subItem");
          }
          terrBox.setAttribute("class", "subItem terrActive");

          const legendSet = Object.keys(data[terr]);
          makeLineChart(data[terr], legendSet, trayWidth, trayWidth * 0.5, document.body, palette, terr + " PRODUCT BUDGET");
        };
      }

      const legendSet = Object.keys(data[territory]);
      checkbox.checked = false;
      makeLineChart(data[territory], legendSet, width, width * 0.5, document.body, palette, territory + " PRODUCT BUDGET");
      tag.innerHTML = "stack";
    };

    let total = 0;
    for (let j = 0; j < legendSet.length; j++) {
      total += data[dataKeys[i]][legendSet[j]] ? data[dataKeys[i]][legendSet[j]][12] : 0;
    }
    let sum = 0;
    for (let j = 0; j < legendSet.length; j++) {
      const productQuota = data[dataKeys[i]][legendSet[j]] ? data[dataKeys[i]][legendSet[j]][12] : 0;
      const barHeight = checkbox.checked ? productQuota / total * height * 0.75 : productQuota / max * height * 0.8;
      sum += barHeight;
      positionY = height * 0.87 - sum;
      const block = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      block.setAttribute("x", positionX), block.setAttribute("width", barWidth);
      block.setAttribute("y", positionY), block.setAttribute("height", barHeight);
      block.setAttribute("fill", palette[legendSet[j]]);
      chartArea.appendChild(block);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      if (checkbox.checked) {
        let labelContent = productQuota / total * 100;
        labelContent > 0.01 ? labelContent = parseInt(labelContent, 10) : null;
        const labelFont = basicFont * 1.3;
        const cipherWidth = labelContent != 0 ? labelFont * 17 / 30 * (Math.floor(Math.log10(labelContent)) + 2) : 0;

        label.setAttribute("x", medianX - cipherWidth / 2), label.setAttribute("y", positionY + barHeight / 2 + height * 0.01);
        label.setAttribute("font-size", labelFont), label.setAttribute("font-style", "italic");
        labelContent >= 3 ? label.innerHTML = labelContent.toLocaleString() + "%" : null;
        chartArea.appendChild(label);
      } else {
        let labelContent = productQuota / unit;
        labelContent > 0.01 ? labelContent = parseInt(labelContent, 10) : null;
        const labelFont = basicFont * 1.3;
        const cipherWidth = labelContent != 0 ? labelFont * 17 / 30 * ((Math.floor(Math.log10(labelContent)) + 1) + Math.floor(Math.floor(Math.log10(labelContent)) / 3) / 3) : 0;

        label.setAttribute("x", medianX - cipherWidth / 2), label.setAttribute("y", positionY + barHeight / 2 + height * 0.01);
        label.setAttribute("font-size", labelFont);
        labelContent >= 30 ? label.innerHTML = labelContent.toLocaleString() : null;
        chartArea.appendChild(label);
      }
    }

    if (!checkbox.checked) {
      const sumLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const labelContent = parseInt(sum * max / height / 800000, 10);
      const labelFont = basicFont * 1.5;
      const cipherWidth = labelContent != 0 ? labelFont * 17 / 30 * ((Math.floor(Math.log10(labelContent)) + 1) + Math.floor(Math.floor(Math.log10(labelContent)) / 3) / 3) : 0;

      sumLabel.setAttribute("x", medianX - cipherWidth / 2), sumLabel.setAttribute("y", positionY - height * 0.015);
      sumLabel.setAttribute("font-size", basicFont * 1.4), sumLabel.setAttribute("class", "sum");
      sumLabel.innerHTML = labelContent.toLocaleString();
      chartArea.appendChild(sumLabel);
    }
  }

  const legendUnit = legendSet.length > 7 ? Math.ceil(legendSet.length / 2) : legendSet.length;
  const legendInterval = legendUnit < 5 ? 6 : 8;
  for (let i = 0; i < legendSet.length; i++) {
    positionX = width / 2 * (1 - legendUnit / legendInterval) + width / legendInterval * (i % legendUnit + 0.3);
    positionY = legendSet.length > 7 ? height * 0.93 + height * 0.04 * Math.floor(i / legendUnit) : height * 0.95;
    const legendMark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    legendMark.setAttribute("x", positionX - width / 65), legendMark.setAttribute("width", width / 65);
    legendMark.setAttribute("y", positionY), legendMark.setAttribute("height", width / 65);
    legendMark.setAttribute("rx", basicFont / 4), legendMark.setAttribute("ry", basicFont / 4);
    legendMark.setAttribute("fill", palette[legendSet[i]]);
    chartArea.appendChild(legendMark);

    const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legend.setAttribute("x", positionX + 5), legend.setAttribute("y", positionY + height * 0.026);
    legend.setAttribute("font-size", basicFont * 1.4), legend.setAttribute("class", "legend");
    legend.innerHTML = legendSet[i];
    chartArea.appendChild(legend);

    legend.addEventListener("click", function () {
      token = legendSet[i];
      const chart = document.getElementById("chart");
      chart.remove();

      const allProductDiv = document.createElement("div");
      allProductDiv.setAttribute("id", "subMenuDiv");
      document.body.appendChild(allProductDiv);
      const allPushBtn = document.createElement("div");
      allPushBtn.setAttribute("id", "allPushBtn");
      allPushBtn.setAttribute("style", `--color:#6d5dfc`)
      allPushBtn.innerHTML = "전체";
      allPushBtn.onclick = function () {
        allPushBtn.classList.toggle('checked');
        const productItems = document.querySelectorAll(`.productItem`);
        if (allPushBtn.classList.value == "checked") {
          for (let j = 0; j < productItems.length; j++) {
            const productItem = productItems[j];
            productItem.classList.value = "productItem active";
          }
          const chart = document.getElementById("chart");
          chart ? chart.remove() : null;
          for (let terr in productData) {
            productData[terr] = terrSum[terr];
          }
          donutTitle = "ALL Products";
          bakeDonut(productData, dataKeys, trayWidth, trayWidth * 0.5, document.body, rainbow, "ALL Products");
        } else {
          for (let j = 0; j < productItems.length; j++) {
            const productItem = productItems[j];
            productItem.classList.value = "productItem";
          }
          for (let terr in productData) {
            productData[terr] = 0;
          }
          token = "emptyDonut";
        }
      };
      allProductDiv.appendChild(allPushBtn);

      for (let j = 0; j < legendSet.length; j++) {
        const productItem = document.createElement("div");
        productItem.setAttribute("class", "productItem");
        i == j ? productItem.classList.toggle('active') : null;
        productItem.setAttribute("style", `--color:${palette[legendSet[j]]}`)
        productItem.innerHTML = legendSet[j];
        allProductDiv.appendChild(productItem);
      }

      const rainbow = ["red", "orange", "yellowgreen", "green", "skyblue", "blue", "purple", "violet", "pink", "brown", "gray"];
      const productItems = document.querySelectorAll(`.productItem`);
      for (let j = 0; j < productItems.length; j++) {
        const productItem = productItems[j];
        productItem.onclick = function () {
          const chart = document.getElementById("chart");
          chart ? chart.remove() : null;
          token = productItem.innerText;
          productItem.classList.toggle('active');
          if (productItem.classList.value == "productItem active") {
            for (let k = 0; k < dataKeys.length; k++) {
              const terr = dataKeys[k];
              const product = productItem.innerText;
              data[terr][product] ? productData[terr] += data[terr][product][12] : null;
            }
          } else {
            for (let k = 0; k < dataKeys.length; k++) {
              const terr = dataKeys[k];
              const product = productItem.innerText;
              data[terr][product] ? productData[terr] -= data[terr][product][12] : null;
            }
          }
          const activeNodes = document.querySelectorAll(`.active`);
          let productSet = [];
          for (let k = 0; k < activeNodes.length; k++) {
            productSet.push(activeNodes[k].innerText);
          }
          activeNodes.length != legendSet.length ? allPushBtn.classList.value = "" : allPushBtn.classList.value = "checked";
          const codeSet = productSet.sort().map(x => productCodes[x]).join("");
          let title;
          productSet.length == 1 ?
            title = productSet[0] :
            activeNodes.length == legendSet.length ?
              title = "ALL Products" :
              productCodeSet[codeSet] ?
                title = productCodeSet[codeSet] :
                productSet.length == 2 ?
                  title = `${productCodes[productSet[0]]} & ${productCodes[productSet[1]]}` : title = "SEVERAL";
          donutTitle = title;
          productSet.length != 0 ? bakeDonut(productData, dataKeys, trayWidth, trayWidth * 0.5, document.body, rainbow, title) : null;
        };
      }

      for (let j = 0; j < dataKeys.length; j++) {
        data[dataKeys[j]][legendSet[i]] ?
          productData[dataKeys[j]] = data[dataKeys[j]][legendSet[i]][12] : productData[dataKeys[j]] = 0;
      }
      const checkbox = document.querySelector(`.checkbox`);
      checkbox.setAttribute("class", "checkbox hidden");
      bakeDonut(productData, dataKeys, width, height, document.body, rainbow, legendSet[i]);
      donutTitle = legendSet[i];
    });
  }
}

function makeLineChart(data, legendSet, width, height, parentDiv, palette, title) {

  const chartArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chartArea.setAttribute("width", width), chartArea.setAttribute("height", height), chartArea.setAttribute("id", "chart");
  parentDiv.appendChild(chartArea);

  const banner = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const basicFont = width * 0.01;
  const titleFont = basicFont * 2.5;
  const titleWidth = title.length * titleFont * 3 / 5;
  banner.setAttribute("x", (width - titleWidth) / 2);
  banner.setAttribute("y", chartArea.height.baseVal.value / 20);
  banner.setAttribute("font-size", titleFont), banner.setAttribute("font-style", "italic"), banner.setAttribute("fill", "indigo");
  banner.innerHTML = title;
  chartArea.appendChild(banner);

  if (checkbox.checked) {
    const comment = document.createElementNS("http://www.w3.org/2000/svg", "text");
    comment.setAttribute("x", width * 3 / 5), comment.setAttribute("y", chartArea.height.baseVal.value / 13);
    comment.setAttribute("id", "comment");
    comment.setAttribute("font-size", basicFont), comment.setAttribute("font-style", "italic"), comment.setAttribute("fill", "indigo");
    comment.innerHTML = "cumulated by month";
    chartArea.appendChild(comment);
  }

  let max = 0;
  for (let i in data) {
    if (checkbox.checked) {
      max = max > data[i][12] ? max : data[i][12];
    } else {
      for (let j = 0; j < 12; j++) {
        max = max > data[i][j] ? max : data[i][j];
      }
    }
  }
  let unitNum = Math.pow(10, Math.floor(Math.log10(max)));
  max / unitNum < 2 ? unitNum = unitNum / 4 : max / unitNum < 5 ? unitNum = unitNum / 2 : null;
  const unitCipher = Math.floor(Math.log10(unitNum * 5));
  const unit = Math.pow(10, unitCipher - (unitCipher % 3 == 0 ? 3 : unitCipher % 3));

  const axisWidth = width * 0.05;
  let unitPosition = 0;
  for (let i = 0; i <= max / unitNum; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const vPosition = height * 0.87 - unitNum * i / max * height * 0.8;
    i + 1 > max / unitNum ? unitPosition = vPosition - height * 0.045 : null;
    line.setAttribute("x1", width * 0.04), line.setAttribute("x2", width * 0.97);
    line.setAttribute("y1", vPosition), line.setAttribute("y2", vPosition);
    line.setAttribute("stroke", i == 0 ? "black" : "purple"), line.setAttribute("stroke-width", 0.3);
    chartArea.appendChild(line);

    const axisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const axisVal = unitNum / unit * i;
    const cipherWidth = axisVal != 0 ? basicFont * ((Math.floor(Math.log10(axisVal)) + 1) + Math.floor(Math.floor(Math.log10(axisVal)) / 3) / 3) : basicFont;
    axisLabel.setAttribute("x", axisWidth * 0.7 - cipherWidth * 0.6), axisLabel.setAttribute("y", vPosition + height * 0.008);
    axisLabel.setAttribute("font-size", basicFont), axisLabel.setAttribute("font-style", "italic");
    axisLabel.innerHTML = `${axisVal.toLocaleString()}`;
    chartArea.appendChild(axisLabel);
  }
  const unitSign = document.createElementNS("http://www.w3.org/2000/svg", "text");
  unitSign.setAttribute("x", 0), unitSign.setAttribute("y", unitPosition);
  unitSign.innerHTML = `*unit: ${Math.log10(unit) == 6 ? "mil." : Math.log10(unit) == 9 ? "bil." : "??"}`;
  unitSign.setAttribute("font-size", basicFont), unitSign.setAttribute("font-style", "italic"), unitSign.setAttribute("fill", "blue");
  chartArea.appendChild(unitSign);

  let positionX, positionY, medianX;
  const interval = (width * 0.98 - axisWidth) / 12;
  const monthArray = ["Dec.(preYr)", "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov."];
  const monthFont = basicFont * 1.3;
  for (let i = 0; i < 12; i++) {
    medianX = interval * i + axisWidth + interval / 3;
    positionX = medianX - monthFont * 3 / 5;
    const month = document.createElementNS("http://www.w3.org/2000/svg", "text");
    month.setAttribute("x", positionX - 5), month.setAttribute("y", height * 0.905);
    month.setAttribute("font-size", monthFont), month.setAttribute("font-style", "italic");
    month.innerHTML = monthArray[i];
    chartArea.appendChild(month);
  }

  const labelFont = basicFont * 1.2;
  if (checkbox.checked) {
    for (let i in data) {
      const itemLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let sum = 0, itemPath = "";

      for (let j = 0; j < 12; j++) {
        sum += data[i][j];
        positionX = interval * j + axisWidth + interval / 3;
        positionY = height * 0.87 - sum / max * height * 0.8;
        itemPath += j == 0 ? `M${positionX} ${positionY}` : ` L ${positionX} ${positionY}`;

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        let labelContent = sum / unit;
        if (labelContent >= 5) {
          labelContent = parseInt(labelContent, 10);
          const cipherWidth = labelContent != 0 ? labelFont * 17 / 30 * ((Math.floor(Math.log10(labelContent)) + 1) + Math.floor(Math.floor(Math.log10(labelContent)) / 3) / 3) : 0;
          label.setAttribute("x", positionX - cipherWidth / 2), label.setAttribute("y", positionY - height * 0.015);
          label.setAttribute("font-size", labelFont), label.setAttribute("class", i.replace(" ", ""));
          label.innerHTML = labelContent.toLocaleString();
          chartArea.appendChild(label);
        }
      }
      itemLine.setAttribute("stroke", palette[i]), itemLine.setAttribute("stroke-opacity", 0.7), itemLine.setAttribute("stroke-width", basicFont / 2), itemLine.setAttribute("fill", "transparent");
      itemLine.setAttribute("d", itemPath), itemLine.setAttribute("class", i.replace(" ", ""));
      chartArea.appendChild(itemLine);

      sum = 0;
      for (let j = 0; j < 12; j++) {
        sum += data[i][j];
        positionX = interval * j + axisWidth + interval / 3;
        positionY = height * 0.87 - sum / max * height * 0.8;

        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", positionX), dot.setAttribute("cy", positionY), dot.setAttribute("r", basicFont * 0.5);
        dot.setAttribute("stroke", palette[i]), dot.setAttribute("stroke-width", basicFont * 0.2), dot.setAttribute("fill", "white");
        dot.setAttribute("class", i.replace(" ", ""));
        chartArea.appendChild(dot);
      }
    }
  } else {
    const itemSet = Object.keys(data).sort((a, b) => data[b][12] - data[a][12]);
    for (let i = 0; i < itemSet.length; i++) {
      const item = itemSet[i];
      const itemLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let itemPath = "";

      for (let j = 0; j < 12; j++) {
        positionX = interval * j + axisWidth + interval / 3;
        positionY = height * 0.87 - data[item][j] / max * height * 0.8;
        itemPath += j == 0 ? `M${positionX} ${positionY}` : ` L ${positionX} ${positionY}`;

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        let labelContent = data[item][j] / unit;
        if (labelContent >= 5 || labelContent * unit >= max / 10) {
          labelContent = parseInt(labelContent, 10);
          const cipherWidth = labelContent != 0 ? labelFont * 17 / 30 * ((Math.floor(Math.log10(labelContent)) + 1) + Math.floor(Math.floor(Math.log10(labelContent)) / 3) / 3) : 0;
          label.setAttribute("x", positionX - cipherWidth / 2), label.setAttribute("y", positionY);
          label.setAttribute("font-size", labelFont), label.setAttribute("class", itemSet[i].replace(" ", ""));
          label.innerHTML = labelContent.toLocaleString();
          chartArea.appendChild(label);
        }
      }
      itemPath += ` V ${height * 0.87} H ${axisWidth + interval / 3} Z`;
      itemLine.setAttribute("stroke", "transparent"), itemLine.setAttribute("fill", palette[item]), itemLine.setAttribute("fill-opacity", 0.6);
      itemLine.setAttribute("d", itemPath), itemLine.setAttribute("class", itemSet[i].replace(" ", ""));
      chartArea.appendChild(itemLine);
    }
  }

  const legendUnit = legendSet.length > 7 ? Math.ceil(legendSet.length / 2) : legendSet.length;
  const legendInterval = legendUnit < 5 ? 6 : 8;
  let tag;
  for (let i = 0; i < legendSet.length; i++) {
    positionX = width / 2 * (1 - legendUnit / legendInterval) + width / legendInterval * (i % legendUnit + 0.3);
    positionY = legendSet.length > 7 ? height * 0.93 + height * 0.04 * Math.floor(i / legendUnit) : height * 0.95;
    const item = legendSet[i];
    const legendMark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    legendMark.setAttribute("x", positionX - width / 65), legendMark.setAttribute("width", width / 65);
    legendMark.setAttribute("y", positionY), legendMark.setAttribute("height", width / 65);
    legendMark.setAttribute("rx", basicFont / 4), legendMark.setAttribute("ry", basicFont / 4);
    legendMark.setAttribute("fill", palette[item]);
    chartArea.appendChild(legendMark);

    const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legend.setAttribute("x", positionX + 5), legend.setAttribute("y", positionY + height * 0.026);
    legend.setAttribute("font-size", basicFont * 1.4), legend.setAttribute("class", "legend");
    legend.innerHTML = item;
    chartArea.appendChild(legend);

    legend.addEventListener("click", function () {
      if (tag != item) {
        const productTitle = title.replace("PRODUCT", item);
        banner.innerHTML = productTitle;
        banner.setAttribute("fill", palette[item]);
        if (checkbox.checked) {
          const comment = document.getElementById("comment");
          comment.setAttribute("fill", palette[item]);
        }

        for (let j = 0; j < legendSet.length; j++) {
          const legendClass = legendSet[j].replace(" ", "");
          const graphAll = document.querySelectorAll(`.${legendClass}`);
          for (let k = 0; k < graphAll.length; k++) {
            graphAll[k].setAttribute("class", `${legendClass}`);
          }
          if (j != i) {
            const graphOther = document.querySelectorAll(`.${legendClass}`);
            for (let k = 0; k < graphOther.length; k++) {
              graphOther[k].classList.toggle('hide');
            }
          }
        }
        tag = item;
      } else {
        banner.innerHTML = title;
        banner.setAttribute("fill", "indigo");
        if (checkbox.checked) {
          const comment = document.getElementById("comment");
          comment.setAttribute("fill", "indigo");
        }

        for (let j = 0; j < legendSet.length; j++) {
          const legendClass = legendSet[j].replace(" ", "");
          const graphAll = document.querySelectorAll(`.${legendClass}`);
          for (let k = 0; k < graphAll.length; k++) {
            graphAll[k].setAttribute("class", `${legendClass}`);
          }
        }
        tag = "total";
      }
    });
  }
}

function bakeDonut(dataDough, legendSet, trayWidth, trayHeight, parentDiv, palette, title) {

  const donutTray = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  donutTray.setAttribute("width", trayWidth), donutTray.setAttribute("height", trayHeight), donutTray.setAttribute("id", "chart");
  parentDiv.appendChild(donutTray);

  const productColor = { BAVENCIO: "#2759AF", BESPONSA: "#88CCA2", CIBINQO: "#0047BC", CRESEMBA: "#95368E", ELIQUIS: "#77014D", ENBREL: "#73CAC1", ERAXIS: "#1B92D4", IBRANCE: "#3E3092", INLYTA: "#DD007B", LORVIQUA: "#F5A400", PRECEDEX: "#3A3A59", "PREVENAR13(A)": "#00305E", "PREVENAR13(P)": "#E83A5F", SUTENE: "#C70850", TYGACIL: "#F08326", VFEND: "#006555", VIZIMPRO: "#E61587", XALKORI: "#00A6CA", XELJANZ: "#525C52", "XELJANZ 10": "#354544", ZYVOX: "#BB2429" };
  const basicFont = trayWidth * 0.01;
  const center = { x: trayWidth / 3.8, y: trayHeight / 2 };
  const radius = trayHeight / 2.3;
  let startX = center.x, startY = center.y - radius, endX, endY, portion = 0;

  let wholeSum = 0;
  for (let i = 0; i < legendSet.length; i++) {
    const item = legendSet[i];
    wholeSum += dataDough[item] ? dataDough[item] : 0;
  }

  const unitNum = Math.ceil(legendSet.length / Math.ceil(legendSet.length / 7));
  const unitCol = Math.ceil(legendSet.length / unitNum);
  let positionX, positionY, tag;
  for (let i = 0; i < legendSet.length; i++) {
    const item = legendSet[i], itemValue = dataDough[item] ? dataDough[item] : 0;
    const color = Array.isArray(palette) ? palette[i % palette.length] : palette[item];
    const share = itemValue / wholeSum;
    const posiRad = portion + share * Math.PI;
    if (share == 1) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", `${center.x}`), circle.setAttribute("cy", `${center.y}`), circle.setAttribute("r", `${radius}`);
      circle.setAttribute("fill", color), circle.setAttribute("class", `${item}`);
      donutTray.appendChild(circle);
    } else if (share != 0) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const largeArcFlag = share > 0.5 ? 1 : 0;
      portion += 2 * Math.PI * share;
      endX = center.x + radius * Math.sin(portion), endY = center.y - radius * Math.cos(portion);

      path.setAttribute("fill", color), path.setAttribute("stroke", "white");
      path.setAttribute("class", `${item}`);
      path.setAttribute("d", `M ${center.x} ${center.y} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`);
      startX = endX, startY = endY;
      donutTray.appendChild(path);
    }

    if (share > 0.02) {
      const innerText = (share * 100).toFixed(0) + "%";
      const percentFont = basicFont * 1.8;
      const percent = document.createElementNS("http://www.w3.org/2000/svg", "text");
      percent.setAttribute("x", center.x + 0.8 * radius * Math.sin(posiRad)), percent.setAttribute("y", center.y - 0.8 * radius * Math.cos(posiRad));
      percent.setAttribute("text-anchor", "middle"), percent.setAttribute("alignment-baseline", "middle");
      percent.setAttribute("font-size", percentFont);
      percent.setAttribute("class", `${item}tag`);
      color == "purple" || color == "blue" || color == "green" || color == "brown" ? percent.setAttribute("fill", "white") : null;
      percent.innerHTML = innerText;
      donutTray.appendChild(percent);
    }

    positionX = trayWidth * 3 / 5 + trayWidth / 7.5 * (i % unitCol);
    positionY = trayHeight / 2 + basicFont * 0.9 - trayHeight * 0.09 * (unitNum / 2 - Math.floor(i / unitCol));
    const legendMark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    legendMark.setAttribute("x", positionX - trayWidth / 65), legendMark.setAttribute("width", trayWidth / 55);
    legendMark.setAttribute("y", positionY), legendMark.setAttribute("height", trayWidth / 55);
    legendMark.setAttribute("rx", basicFont / 4), legendMark.setAttribute("ry", basicFont / 4);
    legendMark.setAttribute("fill", color), legendMark.setAttribute("class", `${item}`);
    donutTray.appendChild(legendMark);

    const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legend.setAttribute("x", positionX + trayWidth * 0.01), legend.setAttribute("y", positionY + trayHeight * 0.03);
    legend.setAttribute("font-size", basicFont * 1.8), legend.setAttribute("class", `legend ${item}`);
    legend.innerHTML = legendSet[i];

    legend.onclick = function () {
      if (item != tag) {
        for (let j = 0; j < legendSet.length; j++) {
          const pieTag = document.querySelector(`.${legendSet[j]}tag`);
          if (pieTag) {
            pieTag.classList.value = `legend ${legendSet[j]}tag`;
            i != j ? pieTag.classList.toggle('hide') : pieTag.classList.toggle('bold');
          }

          const legendPie = document.querySelectorAll(`.${legendSet[j]}`);
          for (let k = 0; k < legendPie.length; k++) {
            legendPie[k].classList.value = `legend ${legendSet[j]}`;
            i != j ? legendPie[k].classList.toggle('dimmer') : legendPie[k].classList.toggle('bold');
          }
        }
        tag = item;
      } else {
        for (let j = 0; j < legendSet.length; j++) {
          const pieTag = document.querySelector(`.${legendSet[j]}tag`);
          pieTag ? pieTag.classList.toggle('hide') : null;
          const legendPie = document.querySelectorAll(`.${legendSet[j]}`);
          for (let k = 0; k < legendPie.length; k++) {
            legendPie[k].classList.toggle('dimmer');
          }
        }

        const thisPieTag = document.querySelector(`.${item}tag`);
        if (thisPieTag) {
          thisPieTag.classList.toggle('hide'), thisPieTag.classList.toggle('bold');
        }
        const thisPie = document.querySelectorAll(`.${item}`);
        for (let j = 0; j < thisPie.length; j++) {
          thisPie[j].classList.toggle('dimmer');
          thisPie[j].classList.toggle('bold');
        }
        thisPie[0].classList.value == `legend ${item}` ? tag = "total" : null;
      }

      const prevBanner = document.querySelector(`.banner`);
      const previousVol = document.querySelector(`.legendVolume`);
      previousVol ? previousVol.remove() : null;
      if (tag == "total") {
        prevBanner.setAttribute("font-size", basicFont * 2.6);
        prevBanner.setAttribute("x", center.x), prevBanner.setAttribute("y", center.y - basicFont * 2.5);
        prevBanner.setAttribute("text-anchor", "middle");
      } else {
        prevBanner.setAttribute("font-size", basicFont * 1.4);
        prevBanner.setAttribute("x", center.x - radius * 0.45), prevBanner.setAttribute("y", center.y - basicFont * 6.5);
        prevBanner.setAttribute("text-anchor", "start");
        const legendVolume = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const volumeFont = basicFont * 2.1;
        const volumeContent = "₩ " + itemValue.toLocaleString();
        legendVolume.setAttribute("x", center.x + radius * 0.5), legendVolume.setAttribute("y", center.y - volumeFont);
        legendVolume.setAttribute("class", "legendVolume");
        legendVolume.setAttribute("font-size", volumeFont);
        legendVolume.setAttribute("fill", `${productColor[title] ? productColor[title] : "indigo"}`);
        legendVolume.innerHTML = volumeContent;
        donutTray.appendChild(legendVolume);
      }
    };
    donutTray.appendChild(legend);
  }

  const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hole.setAttribute("cx", center.x), hole.setAttribute("cy", center.y);
  hole.setAttribute("r", radius * 3 / 5), hole.setAttribute("fill", "white");
  donutTray.appendChild(hole);

  const banner = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const titleFont = basicFont * 2.6;
  banner.setAttribute("x", center.x), banner.setAttribute("y", center.y - basicFont * 2.5);
  banner.setAttribute("text-anchor", "middle");
  banner.setAttribute("class", "banner");
  banner.setAttribute("font-size", titleFont);
  banner.setAttribute("fill", `${productColor[title] ? productColor[title] : "indigo"}`);
  banner.innerHTML = title;
  donutTray.appendChild(banner);

  const productVolume = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const volumeFont = basicFont * 2.1;
  const volumeContent = "₩ " + wholeSum.toLocaleString();
  productVolume.setAttribute("x", center.x + radius * 0.5), productVolume.setAttribute("y", center.y + titleFont * 17 / 12);
  productVolume.setAttribute("class", "productVolume");
  productVolume.setAttribute("font-size", volumeFont);
  productVolume.setAttribute("fill", `${productColor[title] ? productColor[title] : "indigo"}`);
  productVolume.innerHTML = volumeContent;
  donutTray.appendChild(productVolume);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", center.x - radius * 0.5), line.setAttribute("x2", center.x + radius * 0.5);
  line.setAttribute("y1", center.y), line.setAttribute("y2", center.y), line.setAttribute("class", "dim");
  line.setAttribute("stroke", `${productColor[title] ? productColor[title] : "indigo"}`), line.setAttribute("stroke-width", basicFont / 2), line.setAttribute("stroke-linecap", "round");
  donutTray.appendChild(line);

}

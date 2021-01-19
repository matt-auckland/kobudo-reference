/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import videos from "./videos.js";
var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  onDeviceReady: function () {},
};

app.initialize();

const categories = {};

categories.tekko = document.querySelector(".tekko");
categories.bo = document.querySelector(".bo");
categories.sai = document.querySelector(".sai");
categories.nunchaku = document.querySelector(".nunchaku");

function selectCat(catName) {
  document.querySelector(".selected-cat").classList.remove("selected-cat");
  document.querySelector(`#${catName}`).classList.add("selected-cat");

  for (const cat in categories) {
    categories[cat].classList.add("hidden");
  }
  categories[catName].classList.remove("hidden");

  updateFilters();
}

function updateFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const requiredFilters = Array.from(
    document.querySelectorAll(".weapon-category:not(.hidden) .video-with-title")
  )
    .reduce(function (accum, item) {
      const classes = item.classList.toString().split(" ");

      let rank = classes.filter((c) => c.includes("rank-"))[0];

      if (rank) {
        rank = rank.replace("rank", "grade");
        if (!accum.includes(rank)) {
          accum.push(rank);
        }
      }
      return accum;
    }, [])
    .sort()
    .reverse();

  filterBtns.forEach((btn) => {
    btn.classList.remove("hidden");
    const classes = btn.classList.toString();
    const grade = classes.slice(classes.indexOf("grade-"));
    if (!requiredFilters.includes(grade)) {
      btn.classList.add("hidden");
    }
  });
}

function selectKyuFilter(grade) {
  const filterBtns = document.querySelectorAll(`.filter-btn`);
  filterBtns.forEach((elm) => {
    elm.classList.remove("active-filter");
  });

  document.querySelector(`.grade-${grade}`).classList.add("active-filter");

  for (let i = 8; i >= grade; i--) {
    const toShow = document.querySelectorAll(`.rank-${i}`);
    toShow.forEach((elm) => {
      elm.classList.remove("hidden");
    });
  }

  for (let j = 0; j < grade; j++) {
    const toHide = document.querySelectorAll(`.rank-${j}`);
    toHide.forEach((elm) => {
      elm.classList.add("hidden");
    });
  }
}

// selectCat("bo");
// selectKyuFilter(0);
setup();

function setup() {
  calculateRanks();

  let filteredVideos = filterVideos({});
  populateHeader({});
  renderVideos(filteredVideos);
}

function populateHeader({ activeWeapon, activeRank }) {
  if (!activeWeapon) activeWeapon = "Bo";
  if (!activeRank) activeRank = 10;

  const header = document.querySelector("header");
  header.innerHTML = `<nav></nav> <div class="filter-btns"></div>`;
  const nav = header.querySelector("nav");
  let navHtml = Object.keys(videos).map((weapon, i) => {
    const html = `<span id="${weapon}" class="fake-link ${
      weapon == activeWeapon && "active"
    }" onclick="selectCat('${weapon}')">${weapon}</span>`;

    if (i % 2 == 1 && i > videos.length - 1)
      html += `<span class="break">/</span>`;
    return html;
  });

  nav.innerHTML = navHtml.join(" ");

  const filters = header.querySelector(".filter-btns");
  debugger;
  let filterHtml = videos[activeWeapon].ranks.map((rank) => {
    const html = `<button
      class="filter-btn grade-${rank} ${activeRank == rank && "active"}}"
      onclick="selectKyuFilter(${rank})"
    >
      ${getRankName(rank)}
    </button>`;
    return html;
  });
  filters.innerHTML = filterHtml.join(" ");
}

function renderVideos(videos) {
  const content = document.querySelector("#content");
}

function filterVideos({ weapon, rank }) {
  if (!weapon) weapon = "Bo";
  if (!rank) rank = 10;
  let weaponVideos = videos[weapon];
  Object.keys(weaponVideos).forEach((cat) => {
    if (cat !== "name") {
      weaponVideos[cat] = weaponVideos[cat].filter(
        (video) => video.rank <= rank
      );
    }
  });
  return weaponVideos;
}

function calculateRanks() {
  Object.keys(videos).map((weapon) => {
    function callback(vid) {
      if (!videos[weapon].ranks.includes(vid.rank)) {
        videos[weapon].ranks.push(vid.rank);
      }
    }
    videos[weapon].ranks = [];

    if (videos[weapon].Junbi) {
      videos[weapon].Junbi.forEach(callback);
    }
    if (videos[weapon].Kihon) {
      videos[weapon].Kihon.forEach(callback);
    }
    if (videos[weapon].Kata) {
      videos[weapon].Kata.forEach(callback);
    }
    if (videos[weapon].Kumite) {
      videos[weapon].Kumite.forEach(callback);
    }
    videos[weapon].ranks.sort().reverse();
  });
}

function getRankName(rank) {
  if (rank == 0) return "Shodan";

  let suffix = "th";
  if (rank == 1) suffix = "st";
  if (rank == 2) suffix = "nd";
  if (rank == 3) suffix = "rd";

  return `${rank}${suffix} Kyu`;
}

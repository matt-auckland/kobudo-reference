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

  onDeviceReady: function () {
    // setup();
  },
};

app.initialize();

//TODO get working
function selectWeapon(event) {
  const weapon = event.target.getAttribute("data-weapon");
  let filteredVideos = filterVideos({ weapon });
  populateHeader({});
  renderVideos(filteredVideos);
  // document.querySelector(".selected-cat").classList.remove("selected-cat");
  // document.querySelector(`#${catName}`).classList.add("selected-cat");

  // for (const cat in categories) {
  //   categories[cat].classList.add("hidden");
  // }
  // categories[catName].classList.remove("hidden");

  // updateFilters();
}

//TODO get working
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

//TODO get working
function filterByRank(event) {
  const rank = event.target.getAttribute("data-rank");
  let filteredVideos = filterVideos({ weapon: activeWeapon, rank });
  populateHeader({});
  renderVideos(filteredVideos);
}

setup();

function setup() {
  calculateRanks();
  let filteredVideos = filterVideos({});
  populateHeader({});
  renderVideos(filteredVideos);
}

function populateHeader({ activeRank }) {
  if (!activeRank) activeRank = 10;

  const header = document.querySelector("header");
  header.innerHTML = null;

  const nav = document.createElement("nav");
  Object.keys(videos).forEach((weapon, i) => {
    const span = document.createElement("span");
    span.setAttribute("data-weapon", weapon);
    span.innerText = weapon;
    span.id = weapon;
    span.classList.add("fake-link");
    if (weapon == activeWeapon) span.classList.add("active");
    span.onclick = selectWeapon;

    nav.appendChild(span);

    if (i % 2 == 1 && i > videos.length - 1) {
      const seperator = document.createElement("span");
      seperator.classList.add("break");
      nav.appendChild(seperator);
    }
  });
  header.appendChild(nav);

  const filterBtnCont = document.createElement("div");
  filterBtnCont.classList.add("filter-btns");
  videos[activeWeapon].ranks.forEach((rank) => {
    const button = document.createElement("button");
    button.setAttribute("data-rank", rank);
    button.innerText = getRankName(rank);
    button.classList.add("filter-btn");
    if (activeRank == rank) button.classList.add("active");
    button.onclick = filterByRank;

    filterBtnCont.appendChild(button);
  });

  header.appendChild(filterBtnCont);
}

function renderVideos(videos) {
  const content = document.querySelector("#content");
  content.innerHTML = null;

  const title = document.createElement("h1");
  title.innerText = videos.name;
  title.classList.add("title");
  content.appendChild(title);

  if (videos?.Junbi?.length) {
    content.appendChild(createVideoSection("Junbi", videos.Junbi));
  }

  if (videos?.Kihon?.length) {
    content.appendChild(createVideoSection("Kihon", videos.Kihon));
  }
  if (videos?.Kata?.length) {
    content.appendChild(createVideoSection("Kata", videos.Kata));
  }
  if (videos?.Kumite?.length) {
    content.appendChild(createVideoSection("Kumite", videos.Kumite));
  }
}

function createVideoSection(sectTitle, vidArray) {
  let section = document.createElement("section");
  const title = document.createElement("h2");
  title.appendChild(document.createTextNode(sectTitle));

  title.setAttribute("data-lowest-rank", vidArray.map((v) => v.rank).sort()[0]);
  section.appendChild(title);
  vidArray.forEach((vid) => {
    const figure = document.createElement("figure");
    figure.classList.add("video-with-title", `rank-${vid.rank}`);
    const video = document.createElement("video");
    video.setAttribute("src", vid.src);
    video.setAttribute("controls", "");
    const figcaption = document.createElement("figcaption");
    figcaption.innerText = vid.caption;

    figure.appendChild(video);
    figure.appendChild(figcaption);
    section.appendChild(figure);
  });

  return section;
}
function filterVideos({ weapon, rank }) {
  if (!weapon) weapon = "Bo";
  if (!rank) rank = 10;
  window.activeWeapon = weapon;
  let weaponVideos = videos[weapon];
  Object.keys(weaponVideos).forEach((cat) => {
    if (!["name", "ranks"].includes(cat)) {
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

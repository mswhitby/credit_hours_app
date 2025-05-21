async function insertPartial(file, elementId) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
}

async function setup() {
    await insertPartial("header.html", "header");
    await insertPartial("studentTemplate.html", "result");

    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateEl.textContent = today.toLocaleDateString('en-US', options);
    }

    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", searchStudent);
    } else {
        console.warn("search-btn not found — make sure header.html has finished loading");
    }
}

document.addEventListener("DOMContentLoaded", setup);

function searchStudent() {
    const id = document.getElementById("student-id-search").value.trim();
    const data = searchByID(id);
    const section = document.getElementById("student-section");
    const result = document.getElementById("result");

    if (!data) {
        result.innerHTML = "<p>No student found.</p>";
        return;
    }

    const tmpl = document.getElementById("student-template");
    const clone = tmpl.content.cloneNode(true);

    clone.querySelector("#student-name").textContent = data.name;
    clone.querySelector("#student-id").textContent = data.id;
    clone.querySelector("#student-grade").textContent = data.grade;

    clone.querySelector("#hours-lost").textContent = data.missedHours;
    clone.querySelector("#hours-gained").textContent = data.madeUpHours;
    clone.querySelector("#hours-needed").textContent = data.missedHours - data.madeUpHours;


    const tbody = clone.querySelector(".attendance-table");
    tbody.innerHTML = data.attendanceHistory.map(row => `
    <tr>
      <td>${row.date}</td>
      <td>${row.type}${row.activity ? ` (${row.activity})` : ''}</td>
      <td>${row.hours}</td>
      <td class="${row.status === 'Missed' ? 'status-missed' : 'status-completed'}">${row.status}</td>
    </tr>
  `).join('');

    result.innerHTML = ""; // Clear any existing content
    result.appendChild(clone);
    section.style.display = "block";
}





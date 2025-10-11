import '../scss/style.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Chart from 'chart.js/auto';
import _ from 'lodash';
import dayjs from 'dayjs';
import '@webdatarocks/webdatarocks/webdatarocks.css';
import WebDataRocks from '@webdatarocks/webdatarocks';

import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {
  fetchAndFormatUsers,
  validateUser,
  getValidUsers,
  filterUsers,
  sortUsers,
  findUser,
  generateId,
  getRandomBgColor,
} from './lab2-tasks.js';

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl: markerShadowUrl,
});

let pivotTable = null;
let coursePieChart = null;
let currentPage = 1;
let isLoading = false;
let lastFetchedCount = 0;
let allTeachers = [];
let currentView = [];
const currentFilters = {
  country: 'all',
  age: 'all',
  gender: 'all',
  photo: false,
  favorite: false,
};
let currentSearchTerm = '';
const sortState = { key: 'full_name', direction: 'asc' };

const topTeachersGrid = document.querySelector('.teachers-grid');
const favoritesGrid = document.querySelector('.favorites-grid');
const statsTableBody = document.getElementById('stats-table-body');
const statsTableHeader = document.getElementById('stats-table-header');
const loadMoreBtn = document.getElementById('load-more-btn');
const statsTabs = document.querySelectorAll('.stats-tab');
const statsViews = document.querySelectorAll('.stats-view');
const pieCanvas = document.getElementById('statsPieChart');

function capitalize(s) {
  return (typeof s === 'string' && s)
    ? s.charAt(0).toLocaleUpperCase() + s.slice(1)
    : s;
}

function getCoords(t) {
  const lat = t?.lat ?? t?.latitude ?? t?.coordinates?.latitude ?? t?.location?.coordinates?.latitude;
  const lng = t?.lng ?? t?.longitude ?? t?.coordinates?.longitude ?? t?.location?.coordinates?.longitude;

  if (lat == null || lng == null) return null;
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  return { lat: latNum, lng: lngNum };
}

function getCourseCounts(list) {
  const counts = _.countBy(list || [], (t) => t.course || 'N/A');
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  return { labels, data };
}

function daysUntilBirthday(birthDateStr) {
  if (!birthDateStr) return null;
  const today = dayjs().startOf('day');
  const b = dayjs(birthDateStr);
  if (!b.isValid()) return null;

  const month = b.month();
  const date = b.date();
  let next = dayjs().year(today.year()).month(month).date(date);
  if (next.isBefore(today)) next = next.add(1, 'year');
  return next.diff(today, 'day'); // ціла кількість днів
}

const buildTeacherCard = (t) => {
  const hasPhoto = !!t.picture_large;
  const initials = (t.full_name || '?')
    .split(' ')
    .map((n) => n?.[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const [firstName = '', lastName = ''] = (t.full_name || '').split(' ');
  const avatarHTML = hasPhoto
    ? `<img src="${t.picture_large}" alt="${t.full_name}" referrerpolicy="no-referrer">`
    : `<div class="teacher-avatar initial-avatar" style="background-color:${t.bg_color || '#1f75cb'}"><span class="initials">${initials}</span></div>`;
  const starHTML = t.favorite ? '<div class="star-badge">★</div>' : '';
  return `
    <div class="teacher-card" data-teacher-id="${t.id}">
      <div class="teacher-avatar">${avatarHTML}${starHTML}</div>
      <h3 class="teacher-name">${firstName}<br>${lastName}</h3>
      <p class="teacher-subject">${t.course || 'N/A'}</p>
      <p class="teacher-location">${t.country || ''}</p>
    </div>`;
};

function displayCoursePie(list) {
  if (!pieCanvas) return;

  const { labels, data } = getCourseCounts(list);
  const allZero = data.length === 0 || data.every((v) => v === 0);
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#77DD77', '#836953', '#FFB347'];
  const backgroundColors = labels.map((_, index) => colors[index % colors.length]);
  if (allZero) {
    if (coursePieChart) { coursePieChart.destroy(); coursePieChart = null; }
    return;
  }

  if (coursePieChart) coursePieChart.destroy();

  coursePieChart = new Chart(pieCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ label: 'Teachers by Subject', data, backgroundColor: backgroundColors }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Teachers by Subject' },
      },
    },
  });
}

const displayPivotTable = (teachers) => {
  const pivotView = document.getElementById('stats-pivot-view');
  if (pivotView && !document.getElementById('pivot-controls')) {
    const controls = document.createElement('div');
    controls.id = 'pivot-controls';
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.margin = '0 0 10px 0';
    controls.innerHTML = `
      <button id="btn-pivot-country" class="stats-tab" style="border:none;padding:8px 12px;cursor:pointer;">By Country</button>
      <button id="btn-pivot-flat" class="stats-tab" style="border:none;padding:8px 12px;cursor:pointer;">Flat (All Teachers)</button>
    `;
    pivotView.insertBefore(controls, document.getElementById('pivot-container'));
  }

  const getPivotFields = () => ([
    { uniqueName: 'full_name', caption: 'Full Name', type: 'string' },
    { uniqueName: 'course', caption: 'Specialty', type: 'string' },
    { uniqueName: 'age', caption: 'Age', type: 'number' },
    { uniqueName: 'gender', caption: 'Gender', type: 'string' },
    { uniqueName: 'country', caption: 'Country', type: 'string' },
    { uniqueName: 'city', caption: 'City', type: 'string' },
    { uniqueName: 'email', caption: 'Email', type: 'string' },
    { uniqueName: 'phone', caption: 'Phone', type: 'string' },
    { uniqueName: 'b_date', caption: 'Birth Date', type: 'string' },
    { uniqueName: 'id', caption: 'ID', type: 'string' },
  ]);

  const makeCountryReport = (data) => ({
    dataSource: { data },
    fields: getPivotFields(),
    slice: {
      rows: [{ uniqueName: 'country', caption: 'Country' }],
      columns: [{ uniqueName: 'Measures' }],
      measures: [
        { uniqueName: 'id', aggregation: 'count', caption: 'Teachers' },
      ],
    },
    options: { grid: { type: 'classic' } },
  });

  const makeFlatReport = (data) => ({
    dataSource: { data },
    fields: getPivotFields(),
    slice: {
      rows: [
        { uniqueName: 'full_name' },
        { uniqueName: 'course' },
        { uniqueName: 'age' },
        { uniqueName: 'gender' },
        { uniqueName: 'country' },
        { uniqueName: 'city' },
        { uniqueName: 'email' },
        { uniqueName: 'phone' },
        { uniqueName: 'b_date' },
      ],
    },
    options: {
      grid: {
        type: 'flat',
        showTotals: 'off',
        showGrandTotals: 'off',
      },
    },
  });

  if (!pivotTable) {
    pivotTable = new WebDataRocks({
      container: '#pivot-container',
      toolbar: true,
      report: makeCountryReport(teachers),
    });

    document.getElementById('btn-pivot-country')?.addEventListener('click', () => {
      pivotTable.setReport(makeCountryReport(allTeachers));
    });
    document.getElementById('btn-pivot-flat')?.addEventListener('click', () => {
      pivotTable.setReport(makeFlatReport(allTeachers));
    });
  } else {
    pivotTable.updateData({ data: teachers });
  }
};

const displayTeacherList = (container, teachers) => {
  if (!container) return;
  container.innerHTML = teachers.length
    ? teachers.map(buildTeacherCard).join('')
    : '<p class="no-teachers-found">No teachers found matching your criteria.</p>';
};

const displayTeacherStats = (teachers) => {
  if (!statsTableBody) return;
  statsTableBody.innerHTML = teachers.map((t) => `
    <tr>
      <td>${t.full_name || ''}</td>
      <td>${t.course || 'N/A'}</td>
      <td>${t.age ?? ''}</td>
      <td>${t.gender || ''}</td>
      <td>${t.country || ''}</td>
    </tr>`).join('');
};

function updateSortHeaderClasses() {
  if (!statsTableHeader) return;
  statsTableHeader.querySelectorAll('th[data-sort-by]').forEach((th) => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sortBy === sortState.key) {
      th.classList.add(sortState.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

const sortAndDisplayStatistics = (source) => {
  let data;
  if (Array.isArray(source) && source.length) {
    data = source;
  } else if (currentView.length) {
    data = currentView;
  } else {
    data = allTeachers;
  }
  const sorted = sortUsers(data, sortState.key, sortState.direction);
  updateSortHeaderClasses();
  displayTeacherStats(sorted);
};

function applyAndDisplayFilters() {
  const criteria = {
    country: currentFilters.country !== 'all' ? currentFilters.country : undefined,
    gender: currentFilters.gender !== 'all' ? currentFilters.gender : undefined,
    favorite: currentFilters.favorite ? true : undefined,
    hasPhoto: currentFilters.photo || undefined,
    ageRange: currentFilters.age,
    searchTerm: currentSearchTerm || undefined,
  };

  currentView = filterUsers(allTeachers, criteria);
  displayTeacherList(topTeachersGrid, currentView);
  return currentView;
}

const displayAllLists = () => {
  const filtered = applyAndDisplayFilters();
  const favs = filterUsers(allTeachers, { favorite: true });
  displayTeacherList(favoritesGrid, favs);
  sortAndDisplayStatistics(filtered);
  const chartActive = document.getElementById('stats-chart-view')?.classList.contains('active');
  if (chartActive) displayCoursePie(filtered);
  const pivotActive = document.getElementById('stats-pivot-view')?.classList.contains('active');
  if (pivotActive) displayPivotTable(allTeachers);
};

function updateLoadMoreVisibility() {
  if (!loadMoreBtn) return;
  if (lastFetchedCount < 10) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-flex';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const apiTeachers = await fetchAndFormatUsers(50);
    lastFetchedCount = Array.isArray(apiTeachers) ? apiTeachers.length : 0;
    allTeachers = getValidUsers(apiTeachers);
  } catch (e) {
    console.warn('Failed to load teachers from API:', e);
    allTeachers = [];
    if (topTeachersGrid) {
      topTeachersGrid.innerHTML = '<p class="no-teachers-found">Failed to load teachers from API.</p>';
    }
  }

  const addTeacherForm = document.getElementById('add-teacher-form');
  const formErrorsContainer = document.querySelector('.form-errors');
  const popupStar = document.getElementById('popupStar');

  function initFilterOptions() {
    const countryFilter = document.getElementById('country-filter');
    const genderFilter = document.getElementById('gender-filter');
    const ageFilter = document.getElementById('age-filter');

    const countries = [...new Set(allTeachers.map((t) => t.country).filter(Boolean))].sort();
    if (countryFilter) {
      countryFilter.innerHTML = '<option value="all">All Countries</option>';
      countries.forEach((c) => countryFilter.add(new Option(c, c)));
    }

    const genders = [...new Set(allTeachers.map((t) => t.gender).filter(Boolean))].sort();
    if (genderFilter) {
      genderFilter.innerHTML = '<option value="all">All Genders</option>';
      genders.forEach((g) => genderFilter.add(new Option(g, g)));
    }

    if (ageFilter) {
      ageFilter.innerHTML = `
        <option value="all">All Ages</option>
        <option value="18-30">18-30</option>
        <option value="31-59">31-59</option>
        <option value="60+">60+</option>`;
    }
  }

  function initAddTeacherFormOptions() {
    const specialtySelect = document.getElementById('specialty');
    const countrySelect = document.getElementById('country');
    if (specialtySelect) {
      specialtySelect.innerHTML = '<option value="">Select specialty</option>';
      const COURSES = [
        'Mathematics', 'Physics', 'English', 'Computer Science',
        'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics',
      ];
      COURSES.forEach((c) => specialtySelect.add(new Option(c, c)));
    }

    const countries = [...new Set(allTeachers.map((t) => t.country).filter(Boolean))].sort();
    if (countrySelect) {
      countrySelect.innerHTML = '<option value="">Select country</option>';
      countries.forEach((c) => countrySelect.add(new Option(c, c)));
    }
  }

  function calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date(); const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  function bindEventHandlers() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-btn');

    document.querySelector('.filters')?.addEventListener('change', (e) => {
      const { id, value, checked } = e.target;
      if (id === 'country-filter') currentFilters.country = value;
      if (id === 'age-filter') currentFilters.age = value;
      if (id === 'gender-filter') currentFilters.gender = value;
      if (id === 'photo-filter') currentFilters.photo = checked;
      if (id === 'favorite-filter') currentFilters.favorite = checked;
      displayAllLists();
    });

    searchButton?.addEventListener('click', () => {
      currentSearchTerm = searchInput?.value || '';
      displayAllLists();
    });
    searchInput?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        currentSearchTerm = searchInput.value || '';
        displayAllLists();
      }
    });

    statsTableHeader?.addEventListener('click', (e) => {
      const th = e.target.closest('th');
      if (!th || !th.dataset.sortBy) return;
      const sortKey = th.dataset.sortBy;
      if (sortState.key === sortKey) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.key = sortKey;
        sortState.direction = 'asc';
      }
      sortAndDisplayStatistics();
    });

    document.querySelector('.stats-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.stats-tab');
      if (!btn) return;

      const { view } = btn.dataset;

      statsTabs.forEach((b) => b.classList.toggle('active', b === btn));

      statsViews.forEach((v) => v.classList.toggle('active', v.id === `stats-${view}-view`));

      if (view === 'chart') {
        const list = currentView.length ? currentView : allTeachers;
        displayCoursePie(list);
        setTimeout(() => coursePieChart?.resize(), 50);
      }
      if (view === 'pivot') {
        displayPivotTable(allTeachers);
      }
    });

    addTeacherForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formErrorsContainer) formErrorsContainer.innerHTML = '';

      const fd = new FormData(e.target);
      const errors = [];
      const required = ['name', 'specialty', 'country', 'city', 'email', 'phone', 'dob'];

      required.forEach((field) => {
        const v = (fd.get(field) || '').toString().trim();
        if (!v) errors.push(`${capitalize(field)} is required.`);
      });

      const email = (fd.get('email') || '').toString().trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format.');

      const dob = (fd.get('dob') || '').toString();
      const age = dob ? calculateAge(dob) : null;
      if (dob && (age ?? 0) < 18) errors.push('Teacher must be at least 18 years old.');

      if (errors.length) {
        formErrorsContainer && (formErrorsContainer.innerHTML = [...new Set(errors)].map((e) => `<p>${e}</p>`).join(''));
        return;
      }

      const newTeacher = {
        id: crypto?.randomUUID ? crypto.randomUUID() : generateId(),
        full_name: (fd.get('name') || '').toString().trim(),
        course: (fd.get('specialty') || '').toString(),
        country: (fd.get('country') || '').toString(),
        city: (fd.get('city') || '').toString().trim(),
        email,
        phone: (fd.get('phone') || '').toString().trim(),
        b_date: dob || null,
        age,
        gender: capitalize((fd.get('sex') || 'male').toString()),
        note: (fd.get('notes') || '').toString().trim(),
        favorite: false,
        bg_color: getRandomBgColor(),
        picture_large: null,
        picture_thumbnail: null,
      };

      const { isValid, errors: vErrors } = validateUser(newTeacher);
      if (!isValid) {
        formErrorsContainer && (formErrorsContainer.innerHTML = vErrors.map((e) => `<p>${e}</p>`).join(''));
        return;
      }

      fetch('http://localhost:3000/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Server responded ${res.status}`);
          return res.json();
        })
        .then((savedTeacher) => {
          allTeachers.unshift(savedTeacher);
          displayAllLists();
          initFilterOptions();

          document.getElementById('addTeacherPopup')?.classList.remove('popup--visible');
          addTeacherForm.reset();
        })
        .catch((err) => {
          console.error('Failed to save teacher:', err);
          formErrorsContainer && (formErrorsContainer.innerHTML = '<p>Failed to save teacher. Try again.</p>');
        });
    });

    const addTeacherPopup = document.getElementById('addTeacherPopup');
    document.querySelectorAll('.add-teacher-btn').forEach((btn) => btn.addEventListener('click', () => addTeacherPopup?.classList.add('popup--visible')));
    document.getElementById('closeAddTeacherPopup')?.addEventListener('click', () => addTeacherPopup?.classList.remove('popup--visible'));
    addTeacherPopup?.addEventListener('click', (e) => {
      if (e.target === addTeacherPopup) addTeacherPopup.classList.remove('popup--visible');
    });

    const teacherInfoPopup = document.getElementById('teacherInfoPopup');
    if (teacherInfoPopup) {
      const closeBtn = document.getElementById('closeTeacherInfoPopup');
      const popupAvatar = teacherInfoPopup.querySelector('.info-avatar');
      const popupName = teacherInfoPopup.querySelector('.info-name');
      const popupSubject = teacherInfoPopup.querySelector('.info-subject');
      const popupAgeGender = teacherInfoPopup.querySelector('.info-age-gender');
      const popupLocation = teacherInfoPopup.querySelector('.info-location');
      const popupBirthday = teacherInfoPopup.querySelector('.info-birthday');
      const popupEmail = teacherInfoPopup.querySelector('.info-email');
      const popupPhone = teacherInfoPopup.querySelector('.info-phone');
      const popupDescription = teacherInfoPopup.querySelector('.info-description');
      const mapContainer = document.getElementById('teacherMap');
      const mapToggle = teacherInfoPopup.querySelector('.info-map-toggle');

      let leafletMap = null;
      let leafletMarker = null;

      function showMap({ lat, lng }, label) {
        if (!mapContainer) return;
        mapContainer.hidden = false;

        if (!leafletMap) {
          leafletMap = L.map(mapContainer, { zoomControl: true }).setView([lat, lng], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(leafletMap);
        } else {
          leafletMap.setView([lat, lng], 12);
        }

        if (leafletMarker) leafletMap.removeLayer(leafletMarker);
        leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
        if (label) leafletMarker.bindPopup(label);

        setTimeout(() => leafletMap.invalidateSize(), 0);
      }

      function hideMap() {
        if (mapContainer) mapContainer.hidden = true;
      }

      const updatePopupStar = (isFav) => {
        if (!popupStar) return;
        popupStar.textContent = '★';
        popupStar.classList.toggle('is-favorite', !!isFav);
        popupStar.classList.toggle('not-favorite', !isFav);
      };

      const openTeacherInfoPopup = (t) => {
        if (!t) return;
        teacherInfoPopup.dataset.currentTeacherId = t.id;

        const initials = (t.full_name || '?')
          .split(' ')
          .map((n) => n?.[0] || '')
          .join('')
          .slice(0, 2)
          .toUpperCase();
        popupAvatar.innerHTML = t.picture_large
          ? `<img src="${t.picture_large}" alt="${t.full_name}" referrerpolicy="no-referrer">`
          : `<div class="initial-avatar" style="background-color:${t.bg_color || '#1f75cb'}"><span class="initials">${initials}</span></div>`;

        popupName.textContent = t.full_name || '';
        popupSubject.textContent = t.course || 'N/A';
        popupAgeGender.textContent = `${t.age ?? ''}, ${t.gender || ''}`;
        const daysLeft = daysUntilBirthday(t.b_date);

        if (daysLeft === 0) {
          popupBirthday.textContent = 'It’s their birthday today!';
        } else {
          popupBirthday.textContent = `Days until birthday: ${daysLeft}`;
        }
        popupLocation.textContent = [t.city, t.country].filter(Boolean).join(', ');
        popupEmail.href = t.email ? `mailto:${t.email}` : '#';
        popupEmail.textContent = t.email || '';
        popupPhone.textContent = t.phone || '';
        popupDescription.textContent = t.note || '';

        updatePopupStar(t.favorite);
        teacherInfoPopup.classList.add('popup--visible');
      };

      popupStar?.addEventListener('click', () => {
        const id = teacherInfoPopup.dataset.currentTeacherId;
        const t = findUser(allTeachers, 'id', id);
        if (!t) return;
        t.favorite = !t.favorite;
        updatePopupStar(t.favorite);
        displayAllLists();
      });

      mapToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!mapContainer) return;

        const isHidden = mapContainer.hidden;
        if (isHidden) {
          const id = teacherInfoPopup.dataset.currentTeacherId;
          const t = findUser(allTeachers, 'id', id);
          const coords = getCoords(t);
          if (!coords) return;

          const label = [t.full_name, [t.city, t.country].filter(Boolean).join(', ')]
            .filter(Boolean).join(' — ');

          showMap(coords, label);
          mapToggle.textContent = 'hide map';
          mapToggle.setAttribute('aria-expanded', 'true');
        } else {
          hideMap();
          mapToggle.textContent = 'toggle map';
          mapToggle.setAttribute('aria-expanded', 'false');
        }
      });

      const closeInfo = () => teacherInfoPopup.classList.remove('popup--visible');

      const handleTeacherClick = (event) => {
        const card = event.target.closest('.teacher-card');
        if (!card) return;
        const id = card.dataset.teacherId;
        const t = findUser(allTeachers, 'id', id);
        openTeacherInfoPopup(t);
      };

      topTeachersGrid?.addEventListener('click', handleTeacherClick);
      favoritesGrid?.addEventListener('click', handleTeacherClick);
      closeBtn?.addEventListener('click', closeInfo);
      teacherInfoPopup.addEventListener('click', (e) => { if (e.target === teacherInfoPopup) closeInfo(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeInfo(); });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.popup.popup--visible').forEach((p) => p.classList.remove('popup--visible'));
    });

    loadMoreBtn?.addEventListener('click', async () => {
      if (isLoading) return;
      isLoading = true;

      const original = loadMoreBtn.textContent;
      loadMoreBtn.textContent = 'Loading...';
      loadMoreBtn.disabled = true;

      try {
        currentPage += 1;
        const next = await fetchAndFormatUsers(10);
        lastFetchedCount = Array.isArray(next) ? next.length : 0;

        const validNext = getValidUsers(next);

        allTeachers.push(...validNext);

        displayAllLists();

        initFilterOptions();
      } catch (e) {
        console.warn('Load more failed:', e);
        currentPage = Math.max(1, currentPage - 1);
      } finally {
        loadMoreBtn.textContent = original;
        loadMoreBtn.disabled = false;
        isLoading = false;
        updateLoadMoreVisibility();
      }
    });
  }

  initFilterOptions();
  initAddTeacherFormOptions();
  displayAllLists();
  updateLoadMoreVisibility();
  bindEventHandlers();
});

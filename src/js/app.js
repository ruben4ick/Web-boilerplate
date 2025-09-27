import '../scss/style.scss';
import {
  formatAndMergeUserData,
  validateUser,
  getValidUsers,
  filterUsers,
  sortUsers,
  findUser,
  generateId,
  getRandomBgColor,
} from './lab2-tasks.js';

const COURSES = [
  'Mathematics', 'Physics', 'English', 'Computer Science',
  'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics',
];

function capitalize(s) { return (typeof s === 'string' && s) ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s; }

const allTeachers = getValidUsers(formatAndMergeUserData());

const topTeachersGrid = document.querySelector('.teachers-grid');
const favoritesGrid = document.querySelector('.favorites-grid');
const statsTableBody = document.getElementById('stats-table-body');
const statsTableHeader = document.getElementById('stats-table-header');

const currentFilters = {
  country: 'all', age: 'all', gender: 'all', photo: false, favorite: false,
};
let currentSearchTerm = '';
const sortState = { key: 'full_name', direction: 'asc' };

const buildTeacherCard = (t) => {
  const hasPhoto = !!t.picture_large;
  const initials = (t.full_name || '?').split(' ').map((n) => n?.[0] || '').join('').slice(0, 2)
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

const sortAndDisplayStatistics = () => {
  const sorted = sortUsers(allTeachers, sortState.key, sortState.direction);
  updateSortHeaderClasses();
  displayTeacherStats(sorted);
};

function applyAndDisplayFilters() {
  const criteria = {
    country: currentFilters.country !== 'all' ? currentFilters.country : undefined,
    gender: currentFilters.gender !== 'all' ? currentFilters.gender : undefined,
    favorite: currentFilters.favorite ? true : undefined,
    hasPhoto: currentFilters.photo || undefined,
    ageRange: currentFilters.age, // 'all' | '18-30' | '31-45' | '46+'
    searchTerm: currentSearchTerm || undefined,
  };

  const filtered = filterUsers(allTeachers, criteria);
  displayTeacherList(topTeachersGrid, filtered);
}

const displayAllLists = () => {
  applyAndDisplayFilters();
  const favs = filterUsers(allTeachers, { favorite: true });
  displayTeacherList(favoritesGrid, favs);
  sortAndDisplayStatistics();
};

document.addEventListener('DOMContentLoaded', () => {
  const addTeacherForm = document.getElementById('add-teacher-form');
  const formErrorsContainer = document.querySelector('.form-errors');
  const teacherInfoPopup = document.getElementById('teacherInfoPopup');
  const popupStar = document.getElementById('popupStar');

  function initFilterOptions() {
    const countryFilter = document.getElementById('country-filter');
    const genderFilter = document.getElementById('gender-filter');
    const ageFilter = document.getElementById('age-filter');

    const countries = [...new Set(allTeachers.map((t) => t.country).filter(Boolean))].sort();
    countryFilter.innerHTML = '<option value="all">All Countries</option>';
    countries.forEach((c) => countryFilter.add(new Option(c, c)));

    const genders = [...new Set(allTeachers.map((t) => t.gender).filter(Boolean))].sort();
    genderFilter.innerHTML = '<option value="all">All Genders</option>';
    genders.forEach((g) => genderFilter.add(new Option(g, g)));

    ageFilter.innerHTML = `
      <option value="all">All Ages</option>
      <option value="18-30">18-30</option>
      <option value="31-59">31-59</option>
      <option value="60+">60+</option>`;
  }

  function initAddTeacherFormOptions() {
    const specialtySelect = document.getElementById('specialty');
    const countrySelect = document.getElementById('country');
    specialtySelect.innerHTML = '<option value="">Select specialty</option>';
    COURSES.forEach((c) => specialtySelect.add(new Option(c, c)));

    const countries = [...new Set(allTeachers.map((t) => t.country).filter(Boolean))].sort();
    countrySelect.innerHTML = '<option value="">Select country</option>';
    countries.forEach((c) => countrySelect.add(new Option(c, c)));
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
      applyAndDisplayFilters();
    });

    searchButton?.addEventListener('click', () => {
      currentSearchTerm = searchInput?.value || '';
      applyAndDisplayFilters();
    });
    searchInput?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        currentSearchTerm = searchInput.value || '';
        applyAndDisplayFilters();
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

      allTeachers.unshift(newTeacher);
      displayAllLists();
      initFilterOptions(); // оновити дропдауни країн/статей, якщо треба
      document.getElementById('addTeacherPopup')?.classList.remove('popup--visible');
      addTeacherForm.reset();
    });

    const addTeacherPopup = document.getElementById('addTeacherPopup');
    document.querySelectorAll('.add-teacher-btn').forEach((btn) => btn.addEventListener('click', () => addTeacherPopup?.classList.add('popup--visible')));
    document.getElementById('closeAddTeacherPopup')?.addEventListener('click', () => addTeacherPopup?.classList.remove('popup--visible'));
    addTeacherPopup?.addEventListener('click', (e) => { if (e.target === addTeacherPopup) addTeacherPopup.classList.remove('popup--visible'); });

    if (teacherInfoPopup) {
      const closeBtn = document.getElementById('closeTeacherInfoPopup');
      const popupAvatar = teacherInfoPopup.querySelector('.info-avatar');
      const popupName = teacherInfoPopup.querySelector('.info-name');
      const popupSubject = teacherInfoPopup.querySelector('.info-subject');
      const popupAgeGender = teacherInfoPopup.querySelector('.info-age-gender');
      const popupLocation = teacherInfoPopup.querySelector('.info-location');
      const popupEmail = teacherInfoPopup.querySelector('.info-email');
      const popupPhone = teacherInfoPopup.querySelector('.info-phone');
      const popupDescription = teacherInfoPopup.querySelector('.info-description');

      const updatePopupStar = (isFav) => {
        if (!popupStar) return;
        popupStar.textContent = '★';
        popupStar.classList.toggle('is-favorite', !!isFav);
        popupStar.classList.toggle('not-favorite', !isFav);
      };

      const openTeacherInfoPopup = (t) => {
        if (!t) return;
        teacherInfoPopup.dataset.currentTeacherId = t.id;

        const initials = (t.full_name || '?').split(' ').map((n) => n?.[0] || '').join('').slice(0, 2)
          .toUpperCase();
        popupAvatar.innerHTML = t.picture_large
          ? `<img src="${t.picture_large}" alt="${t.full_name}" referrerpolicy="no-referrer">`
          : `<div class="initial-avatar" style="background-color:${t.bg_color || '#1f75cb'}"><span class="initials">${initials}</span></div>`;

        popupName.textContent = t.full_name || '';
        popupSubject.textContent = t.course || 'N/A';
        popupAgeGender.textContent = `${t.age ?? ''}, ${t.gender || ''}`;
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
        const t = findUser(allTeachers, 'id', id); // ВАЖЛИВО: findUser з lab2-tasks
        if (!t) return;
        t.favorite = !t.favorite;
        updatePopupStar(t.favorite);
        displayAllLists();
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
  }

  initFilterOptions();
  initAddTeacherFormOptions();
  displayAllLists();
  bindEventHandlers();
});

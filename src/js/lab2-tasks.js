import _ from 'lodash';
import { additionalUsers, randomUserMock } from './FE4U-Lab2-mock.js';

export async function fetchAndFormatUsers(count = 50) {
  const url = `https://randomuser.me/api/?results=${count}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const { results } = data;
  return results.map(formatRandomUser);
}

const COURSES = [
  'Mathematics', 'Physics', 'English', 'Computer Science',
  'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law',
  'Art', 'Medicine', 'Statistics',
];

function getRandomCourse() {
  return COURSES[Math.floor(Math.random() * COURSES.length)];
}

export function getRandomBgColor() {
  const colors = ['#1f75cb', '#dface7', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}

function formatRandomUser(user) {
  return {
    gender: capitalizeFirstLetter(user.gender),
    title: user.name.title,
    full_name: `${user.name.first} ${user.name.last}`,
    city: user.location.city,
    state: user.location.state,
    country: user.location.country,
    postcode: user.location.postcode,
    coordinates: user.location.coordinates,
    timezone: user.location.timezone,
    email: user.email,
    b_date: user.dob.date,
    age: user.dob.age,
    phone: user.phone,
    picture_large: user.picture.large,
    picture_thumbnail: user.picture.thumbnail,
    id: generateId(),
    favorite: Math.random() > 0.5,
    course: getRandomCourse(),
    bg_color: getRandomBgColor(),
    note: `Note for ${user.name.first}`,
    // note: Math.random() > 0.7 ? `Note for ${user.name.first}` : null,
  };
}

function formatAdditionalUser(user) {
  return {
    gender: capitalizeFirstLetter(user.gender),
    title: user.title,
    full_name: user.full_name,
    city: user.city || null,
    state: user.state || null,
    country: user.country || null,
    postcode: user.postcode || null,
    coordinates: user.coordinates || null,
    timezone: user.timezone || null,
    email: user.email || null,
    b_date: user.b_day || user.b_date || null,
    age: user.age || null,
    phone: user.phone || null,
    picture_large: user.picture_large || null,
    picture_thumbnail: user.picture_thumbnail || null,
    id: user.id || generateId(),
    favorite: user.favorite !== undefined ? user.favorite : Math.random() > 0.5,
    course: user.course || getRandomCourse(),
    bg_color: user.bg_color || getRandomBgColor(),
    note: user.note ? capitalizeFirstLetter(user.note) : null,
  };
}

export function formatAndMergeUserData() {
  const formatted = [
    ..._.map(randomUserMock, formatRandomUser),
    ..._.map(additionalUsers, formatAdditionalUser),
  ];
  return _.uniqBy(formatted, (u) => `${u.email}|${u.full_name}`);
}

// Task 2
const isValidPhoneFormat = (phone) => {
  if (!_.isString(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return /^[\d\s\-()+.]+$/.test(phone) && digits.length >= 7;
};
const isValidEmailFormat = (email) => _.isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidCapitalized = (s) => _.isString(s) && s.length > 0 && s[0] === s[0].toUpperCase();

export function validateUser(user) {
  const errors = [];

  ['full_name', 'gender', 'city', 'country'].forEach((f) => {
    if (!isValidCapitalized(user[f] ?? '')) {
      errors.push(`${f} should be a string starting with a capital letter`);
    }
  });
  if (user.note != null && !isValidCapitalized(user.note)) {
    errors.push('note should be a string starting with a capital letter');
  }

  if (user.age != null && !_.isNumber(user.age)) errors.push('age should be a numeric value');
  if (user.phone != null && !isValidPhoneFormat(user.phone)) errors.push('phone should match the required format');
  if (user.email != null && !isValidEmailFormat(user.email)) errors.push('email should contain @ symbol and be valid');

  return { isValid: errors.length === 0, errors };
}

export function validateUserArray(users) {
  const results = _.map(users, (u) => ({ user: u, validation: validateUser(u) }));
  const valid = _.sumBy(results, (r) => (r.validation.isValid ? 1 : 0));
  return {
    total: users.length, valid, invalid: users.length - valid, results,
  };
}

export function getValidUsers(users) {
  return _.filter(users, (u) => validateUser(u).isValid);
}

// Task 3: Simple filtering function
export function filterUsers(users, filters = {}) {
  const {
    country, age, gender, favorite, hasPhoto, ageRange, searchTerm,
  } = filters;

  return _.filter(users, (u) => {
    if (country && u.country !== country) return false;
    if (gender && u.gender !== gender) return false;
    if (!_.isNil(favorite) && u.favorite !== favorite) return false;
    if (hasPhoto && !u.picture_large) return false;

    if (!_.isNil(age) && u.age !== age) return false;

    if (ageRange && ageRange !== 'all') {
      const a = Number(u.age);
      if (!Number.isFinite(a)) return false;
      if (ageRange === '18-30' && (a < 18 || a > 30)) return false;
      if (ageRange === '31-59' && (a < 31 || a > 59)) return false;
      if (ageRange === '60+' && (a < 60)) return false;
    }

    if (_.isString(searchTerm) && _.trim(searchTerm)) {
      const q = _.toLower(_.trim(searchTerm));
      const hay = [
        u.full_name, u.note, u.course, u.gender, u.country, u.city, String(u.age ?? ''),
      ].map((x) => _.toLower(String(x ?? '')));
      if (!hay.some((s) => s.includes(q))) return false;
    }

    return true;
  });
}

// Task 4
export function sortUsers(users, sortBy, order = 'asc') {
  const iteratee = (o) => {
    let v = _.get(o, sortBy);
    if (sortBy === 'b_day') v = new Date(v);
    if (_.isString(v)) return v.toLowerCase();
    return v;
  };
  return _.orderBy(users, [iteratee], [order]);
}

// Task 5
export function findUser(users, searchBy, searchValue) {
  return _.find(users, (u) => {
    const v = _.get(u, searchBy);
    if (_.isNil(v)) return false;
    if (_.isString(v)) return v.toLowerCase().includes(String(searchValue).toLowerCase());
    return _.isNumber(v) || _.isBoolean(v) ? v === searchValue : false;
  }) || null;
}

// Task 6
export function calculatePercentage(users, criteria) {
  if (!users || users.length === 0) return 0;
  const filteredCount = filterUsers(users, criteria).length;
  return Math.round((filteredCount / users.length) * 100);
}
export function calculatePercentageMultiple(users, criteria) {
  if (!users || users.length === 0) return 0;

  const combinedCriteria = {};
  criteria.forEach((criterion) => {
    combinedCriteria[criterion.field] = criterion.value;
  });

  const filteredCount = filterUsers(users, combinedCriteria).length;
  return Math.round((filteredCount / users.length) * 100);
}

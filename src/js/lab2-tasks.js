import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';

const COURSES = [
  'Mathematics', 'Physics', 'English', 'Computer Science',
  'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law',
  'Art', 'Medicine', 'Statistics',
];

function getRandomCourse() {
  return COURSES[Math.floor(Math.random() * COURSES.length)];
}

function getRandomBgColor() {
  const colors = ['#1f75cb', '#dface7', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
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
    note: Math.random() > 0.7 ? `Note for ${user.name.first}` : null,
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

function areUsersDuplicates(user1, user2) {
  return user1.email === user2.email && user1.full_name === user2.full_name;
}

export function formatAndMergeUserData() {
  const formattedRandomUsers = randomUserMock.map(formatRandomUser);

  const formattedAdditionalUsers = additionalUsers.map(formatAdditionalUser);

  const allUsers = [...formattedRandomUsers, ...formattedAdditionalUsers];

  const uniqueUsers = [];
  allUsers.forEach((user) => {
    const isDuplicate = uniqueUsers.some((existingUser) => areUsersDuplicates(user, existingUser));
    if (!isDuplicate) {
      uniqueUsers.push(user);
    }
  });

  return uniqueUsers;
}

// Task 2
function isValidStringFormat(str) {
  return typeof str === 'string' && str.length > 0 && str[0] === str[0].toUpperCase();
}

function isValidNumber(value) {
  return typeof value === 'number';
}

function isValidPhoneFormat(phone) {
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-()+.]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

function isValidEmailFormat(email) {
  if (typeof email !== 'string') return false;
  return email.includes('@') && email.length > 3;
}

export function validateUser(user) {
  const errors = [];

  const stringFields = ['full_name', 'gender', 'note', 'state', 'city', 'country'];
  stringFields.forEach((field) => {
    if (user[field] !== null && user[field] !== undefined) {
      if (!isValidStringFormat(user[field])) {
        errors.push(`${field} should be a string starting with a capital letter`);
      }
    }
  });

  if (user.age !== null && user.age !== undefined) {
    if (!isValidNumber(user.age)) {
      errors.push('age should be a numeric value');
    }
  }

  if (user.phone !== null && user.phone !== undefined) {
    if (!isValidPhoneFormat(user.phone)) {
      errors.push('phone should match the required format');
    }
  }

  if (user.email !== null && user.email !== undefined) {
    if (!isValidEmailFormat(user.email)) {
      errors.push('email should contain @ symbol and be valid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUserArray(users) {
  const results = users.map((user) => ({
    user,
    validation: validateUser(user),
  }));

  const validCount = results.filter((result) => result.validation.isValid).length;
  const invalidCount = results.length - validCount;

  return {
    total: users.length,
    valid: validCount,
    invalid: invalidCount,
    results,
  };
}

// Task 3: Simple filtering function
export function filterUsers(users, filters = {}) {
  return users.filter((user) => {
    if (filters.country && user.country !== filters.country) {
      return false;
    }

    if (filters.age !== undefined && user.age !== filters.age) {
      return false;
    }

    if (filters.gender && user.gender !== filters.gender) {
      return false;
    }

    if (filters.favorite !== undefined && user.favorite !== filters.favorite) {
      return false;
    }

    return true;
  });
}

// Task 4
export function sortUsers(users, sortBy, order = 'asc') {
  return [...users].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (valueA == null) valueA = '';
    if (valueB == null) valueB = '';

    if (sortBy === 'b_day') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    let result;

    if (valueA < valueB) {
      result = -1;
    } else if (valueA > valueB) {
      result = 1;
    } else {
      result = 0;
    }

    return order === 'desc' ? -result : result;
  });
}

// Task 5
export function findUser(users, searchBy, searchValue) {
  return users.find((user) => {
    const userValue = user[searchBy];

    if (userValue == null) {
      return false;
    }

    if (typeof userValue === 'string') {
      return userValue.toLowerCase().includes(searchValue.toString().toLowerCase());
    }

    if (typeof userValue === 'number') {
      return userValue === searchValue;
    }

    if (typeof userValue === 'boolean') {
      return userValue === searchValue;
    }

    return false;
  }) || null;
}

export function findAllUsers(users, searchBy, searchValue) {
  return users.filter((user) => {
    const userValue = user[searchBy];

    if (userValue == null) {
      return false;
    }

    if (typeof userValue === 'string') {
      return userValue.toLowerCase().includes(searchValue.toString().toLowerCase());
    }

    if (typeof userValue === 'number') {
      return userValue === searchValue;
    }

    if (typeof userValue === 'boolean') {
      return userValue === searchValue;
    }

    return false;
  });
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
  criteria.forEach(criterion => {
    combinedCriteria[criterion.field] = criterion.value;
  });

  const filteredCount = filterUsers(users, combinedCriteria).length;
  return Math.round((filteredCount / users.length) * 100);
}

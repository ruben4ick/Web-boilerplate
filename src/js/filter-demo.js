import { formatAndMergeUserData, filterUsers } from './lab2-tasks.js';

console.log('Task 3');
console.log('='.repeat(60));

const users = formatAndMergeUserData();
console.log(`Total users: ${users.length}`);

console.log('\nFilter Examples:');

console.log('\n1. Users from Germany:');
const germanUsers = filterUsers(users, { country: 'Germany' });
console.log(`   Result: ${germanUsers.length} users`);
germanUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n2. Male users:');
const maleUsers = filterUsers(users, { gender: 'Male' });
console.log(`   Result: ${maleUsers.length} users`);

console.log('\n3. Users aged 30:');
const age30Users = filterUsers(users, { age: 30 });
console.log(`   Result: ${age30Users.length} users`);
age30Users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n4. Favorite users:');
const favoriteUsers = filterUsers(users, { favorite: true });
console.log(`   Result: ${favoriteUsers.length} users`);

console.log('\n5. Male users from the United States:');
const usMales = filterUsers(users, {
    country: 'United States',
    gender: 'Male'
});
console.log(`   Result: ${usMales.length} users`);
usMales.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n6. Favorite female users:');
const favoriteFemales = filterUsers(users, {
    gender: 'Female',
    favorite: true
});
console.log(`   Result: ${favoriteFemales.length} users`);
favoriteFemales.slice(0, 3).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n7. 65-year-old users from Germany:');
const german40 = filterUsers(users, {
    country: 'Germany',
    age: 65
});
console.log(`   Result: ${german40.length} users`);
german40.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.gender})`);
});

console.log('\n8. 58-year-old female users from Canada:');
const allFilters = filterUsers(users, {
    country: 'Canada',
    gender: 'Female',
    age: 58,
});
console.log(`   Result: ${allFilters.length} users`);
allFilters.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name}`);
});

console.log('='.repeat(60));

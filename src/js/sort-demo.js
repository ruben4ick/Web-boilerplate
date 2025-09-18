import { formatAndMergeUserData, sortUsers } from './lab2-tasks.js';

console.log('Task 4');
console.log('='.repeat(60));

const users = formatAndMergeUserData();
console.log(`Total users: ${users.length}`);

console.log('\n1. Sort by name (A–Z):');
const sortedByName = sortUsers(users, 'full_name', 'asc');
console.log('First 8 users:');
sortedByName.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n2. Sort by name (Z–A):');
const sortedByNameDesc = sortUsers(users, 'full_name', 'desc');
console.log('First 8 users:');
sortedByNameDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n3. Sort by age (youngest first):');
const sortedByAge = sortUsers(users, 'age', 'asc');
console.log('First 8 users:');
sortedByAge.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n4. Sort by age (oldest first):');
const sortedByAgeDesc = sortUsers(users, 'age', 'desc');
console.log('First 8 users:');
sortedByAgeDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n5. Sort by country (A–Z):');
const sortedByCountry = sortUsers(users, 'country', 'asc');
console.log('First 8 users:');
sortedByCountry.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n6. Sort by country (Z–A):');
const sortedByCountryDesc = sortUsers(users, 'country', 'desc');
console.log('First 8 users:');
sortedByCountryDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n7. Sort by birth date (oldest first):');
const sortedByBirthDate = sortUsers(users, 'b_day', 'asc');
console.log('First 8 users:');
sortedByBirthDate.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n8. Sort by birth date (youngest first):');
const sortedByBirthDateDesc = sortUsers(users, 'b_day', 'desc');
console.log('First 8 users:');
sortedByBirthDateDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('='.repeat(60));

import { formatAndMergeUserData, sortUsers, getValidUsers } from './lab2-tasks.js';

console.log('Task 4');
console.log('='.repeat(60));

const users = formatAndMergeUserData();
const validUsers = getValidUsers(users);
console.log(`Total users: ${validUsers.length}`);

console.log('\n1. Sort by name (A–Z):');
const sortedByName = sortUsers(validUsers, 'full_name', 'asc');
console.log('First 8 users:');
sortedByName.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n2. Sort by name (Z–A):');
const sortedByNameDesc = sortUsers(validUsers, 'full_name', 'desc');
console.log('First 8 users:');
sortedByNameDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n3. Sort by age (youngest first):');
const sortedByAge = sortUsers(validUsers, 'age', 'asc');
console.log('First 8 users:');
sortedByAge.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n4. Sort by age (oldest first):');
const sortedByAgeDesc = sortUsers(validUsers, 'age', 'desc');
console.log('First 8 users:');
sortedByAgeDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n5. Sort by country (A–Z):');
const sortedByCountry = sortUsers(validUsers, 'country', 'asc');
console.log('First 8 users:');
sortedByCountry.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n6. Sort by country (Z–A):');
const sortedByCountryDesc = sortUsers(validUsers, 'country', 'desc');
console.log('First 8 users:');
sortedByCountryDesc.slice(0, 8).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('='.repeat(60));

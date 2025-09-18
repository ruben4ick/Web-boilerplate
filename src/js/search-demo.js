import { formatAndMergeUserData, findUser, findAllUsers } from './lab2-tasks.js';

console.log('Task 5');
console.log('='.repeat(60));

const users = formatAndMergeUserData();
console.log(`Total users: ${users.length}`);

console.log('\n1. Search by name "John" (string field):');
const foundByName = findUser(users, 'full_name', 'John');
if (foundByName) {
    console.log(`   Found: ${foundByName.full_name} (${foundByName.country})`);
} else {
    console.log('   Not found');
}

console.log('\n2. Search by age 30 (numeric field):');
const foundByAge = findUser(users, 'age', 30);
if (foundByAge) {
    console.log(`   Found: ${foundByAge.full_name} (${foundByAge.age} years old)`);
} else {
    console.log('   Not found');
}

console.log('\n3. Search by favorite users (boolean field):');
const foundByFavorite = findUser(users, 'favorite', true);
if (foundByFavorite) {
    console.log(`   Found: ${foundByFavorite.full_name} (favorite: ${foundByFavorite.favorite})`);
} else {
    console.log('   Not found');
}

console.log('\n4. Search by country "Germany" (string field):');
const foundByCountry = findUser(users, 'country', 'Germany');
if (foundByCountry) {
    console.log(`   Found: ${foundByCountry.full_name} (${foundByCountry.country})`);
} else {
    console.log('   Not found');
}

console.log('\n5. Search by gender "Male" (string field):');
const foundByGender = findUser(users, 'gender', 'Male');
if (foundByGender) {
    console.log(`   Found: ${foundByGender.full_name} (${foundByGender.gender})`);
} else {
    console.log('   Not found');
}

console.log('\n6. Search by email "example" (string field):');
const foundByEmail = findUser(users, 'email', 'example');
if (foundByEmail) {
    console.log(`   Found: ${foundByEmail.full_name} (${foundByEmail.email})`);
} else {
    console.log('   Not found');
}

console.log('\n\nExamples of search for all matches:');

console.log('\n7. All users with "Nor" in the name:');
const allWithNor = findAllUsers(users, 'full_name', 'Nor');
console.log(`   Found: ${allWithNor.length} users`);
allWithNor.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n8. All users aged 25:');
const allAge25 = findAllUsers(users, 'age', 25);
console.log(`   Found: ${allAge25.length} users`);
allAge25.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.age} years old)`);
});

console.log('\n9. All favorite users:');
const allFavorites = findAllUsers(users, 'favorite', true);
console.log(`   Found: ${allFavorites.length} users`);
allFavorites.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (favorite: ${user.favorite})`);
});

console.log('\n10. All users from Germany:');
const allFromGermany = findAllUsers(users, 'country', 'Germany');
console.log(`   Found: ${allFromGermany.length} users`);
allFromGermany.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country})`);
});

console.log('\n11. All female users:');
const allFemales = findAllUsers(users, 'gender', 'Female');
console.log(`   Found: ${allFemales.length} users`);
allFemales.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.gender})`);
});

console.log('\n12. All users with notes:');
const allWithNotes = findAllUsers(users, 'note', 'Note');
console.log(`   Found: ${allWithNotes.length} users`);
allWithNotes.slice(0, 5).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.full_name} (${user.country}) - ${user.note}`);
});

console.log('\nDemonstration completed!');
console.log('='.repeat(50));

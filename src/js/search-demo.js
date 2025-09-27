import { formatAndMergeUserData, findUser } from './lab2-tasks.js';

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

console.log('='.repeat(50));

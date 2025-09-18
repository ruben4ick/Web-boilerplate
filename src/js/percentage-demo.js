import { formatAndMergeUserData, calculatePercentage, calculatePercentageMultiple } from './lab2-tasks.js';

console.log('Task 6');
console.log('='.repeat(50));

const users = formatAndMergeUserData();
console.log(`Total users: ${users.length}`);

console.log('\n1. Percentage of users from Germany:');
const germanyPercent = calculatePercentage(users, { country: 'Germany' });
console.log(`   ${germanyPercent}% users from Germany`);

console.log('\n2. Percentage of male users:');
const malePercent = calculatePercentage(users, { gender: 'Male' });
console.log(`   ${malePercent}% male users`);

console.log('\n3. Percentage of favorite users:');
const favoritePercent = calculatePercentage(users, { favorite: true });
console.log(`   ${favoritePercent}% favorite users`);

console.log('\n4. Percentage of users from the United States:');
const usPercent = calculatePercentage(users, { country: 'United States' });
console.log(`   ${usPercent}% users from the United States`);

console.log('\n5. Percentage of female users:');
const femalePercent = calculatePercentage(users, { gender: 'Female' });
console.log(`   ${femalePercent}% female users`);

console.log('\n\nCombined criteria:');

console.log('\n6. Percentage of male users from Germany:');
const maleGermanPercent = calculatePercentageMultiple(users, [
    { field: 'gender', value: 'Male' },
    { field: 'country', value: 'Germany' },
]);
console.log(`   ${maleGermanPercent}% male users from Germany`);

console.log('\n7. Percentage of favorite female users:');
const favoriteFemalePercent = calculatePercentageMultiple(users, [
    { field: 'gender', value: 'Female' },
    { field: 'favorite', value: true },
]);
console.log(`   ${favoriteFemalePercent}% favorite female users`);

console.log('\n8. Percentage of favorite male users:');
const favoriteMalePercent = calculatePercentageMultiple(users, [
    { field: 'gender', value: 'Male' },
    { field: 'favorite', value: true },
]);
console.log(`   ${favoriteMalePercent}% favorite male users`);

console.log('='.repeat(60));

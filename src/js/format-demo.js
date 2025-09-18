import { formatAndMergeUserData } from './lab2-tasks.js';

console.log('Task 1');
console.log('='.repeat(60));

const users = formatAndMergeUserData();
console.log(`\nProcessed ${users.length} users`);

console.log('\nExample of a formatted user:');
const sampleUser = users[0];
console.log(JSON.stringify(sampleUser, null, 2));

console.log('\nCountry statistics:');
const countryStats = {};
users.forEach((user) => {
    if (user.country) {
        countryStats[user.country] = (countryStats[user.country] || 0) + 1;
    }
});

Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([country, count]) => {
        console.log(`   ${country}: ${count} users`);
    });

console.log('='.repeat(60));

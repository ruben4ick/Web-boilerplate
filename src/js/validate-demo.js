import { formatAndMergeUserData, validateUser, validateUserArray } from './lab2-tasks.js';

console.log('Task 2');
console.log('='.repeat(60));

const users = formatAndMergeUserData();

const validationResults = validateUserArray(users);

console.log('\nValidation results:');
console.log(`   • Total users: ${validationResults.total}`);
console.log(`   • Valid users: ${validationResults.valid}`);
console.log(`   • Invalid users: ${validationResults.invalid}`);

if (validationResults.invalid > 0) {
    console.log('\nInvalid users:');
    validationResults.results
        .filter((result) => !result.validation.isValid)
        .slice(0, 5)
        .forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.user.full_name}:`);
            result.validation.errors.forEach((error) => {
                console.log(`   • ${error}`);
            });
        });
} else {
    console.log('\nAll users are valid');
}

console.log('\nAdditional validation tests:');

// Test 1: Valid user
console.log('\n1. Valid user test:');
const validUser = {
    gender: 'Male',
    title: 'Mr',
    full_name: 'John Doe',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    postcode: 10001,
    coordinates: { latitude: '40.7128', longitude: '-74.0060' },
    timezone: { offset: '-5:00', description: 'Eastern Time' },
    email: 'john.doe@example.com',
    b_date: '1990-01-01T00:00:00.000Z',
    age: 34,
    phone: '123-456-7890',
    picture_large: 'https://example.com/large.jpg',
    picture_thumbnail: 'https://example.com/thumb.jpg',
    id: 'test123',
    favorite: true,
    course: 'Computer Science',
    bg_color: '#ff0000',
    note: 'Valid user',
};

const validResult = validateUser(validUser);
console.log(`   Result: ${validResult.isValid ? 'Valid' : 'Invalid'}`);
if (!validResult.isValid) {
    validResult.errors.forEach((error) => console.log(`   • ${error}`));
}

// Test 2: Invalid user
console.log('\n2. Invalid user test:');
const invalidUser = {
    gender: 'male',
    title: 'Mr',
    full_name: 'jane doe',
    city: 'london',
    state: 'england',
    country: 'uk',
    postcode: 12345,
    coordinates: { latitude: '51.5074', longitude: '-0.1278' },
    timezone: { offset: '+0:00', description: 'GMT' },
    email: 'invalid-email',
    b_date: '1995-05-15T00:00:00.000Z',
    age: 'twenty-nine',
    phone: 'invalid',
    note: 'invalid note',
};

const invalidResult = validateUser(invalidUser);
console.log(`   Result: ${invalidResult.isValid ? 'Valid' : 'Invalid'}`);
if (!invalidResult.isValid) {
    console.log('   Errors:');
    invalidResult.errors.forEach((error) => console.log(`   • ${error}`));
}

console.log('='.repeat(60));

// Test script for password validation logic
function testPasswordValidation() {
	console.log('🧪 Testing Password Validation Logic\n');

	// Test cases
	const testCases = [
		{
			name: 'Empty passwords',
			newPassword: '',
			confirmPassword: '',
			expectedError: false,
		},
		{
			name: 'Only new password filled',
			newPassword: 'test123',
			confirmPassword: '',
			expectedError: false,
		},
		{
			name: 'Only confirm password filled',
			newPassword: '',
			confirmPassword: 'test123',
			expectedError: false,
		},
		{
			name: 'Passwords match',
			newPassword: 'test123',
			confirmPassword: 'test123',
			expectedError: false,
		},
		{
			name: 'Passwords do not match',
			newPassword: 'test123',
			confirmPassword: 'test456',
			expectedError: true,
		},
		{
			name: 'Passwords match with spaces',
			newPassword: 'test 123',
			confirmPassword: 'test 123',
			expectedError: false,
		},
		{
			name: 'Passwords do not match with spaces',
			newPassword: 'test 123',
			confirmPassword: 'test 456',
			expectedError: true,
		},
	];

	// Test function (same logic as in PasswordTab)
	function checkPasswordMatch(newPassword, confirmPassword) {
		const shouldShowError = Boolean(
			newPassword && confirmPassword && newPassword !== confirmPassword
		);
		return {
			shouldShowError,
			match: newPassword === confirmPassword,
			bothFilled: Boolean(newPassword && confirmPassword),
		};
	}

	// Run tests
	testCases.forEach((testCase, index) => {
		const result = checkPasswordMatch(
			testCase.newPassword,
			testCase.confirmPassword
		);
		const passed = result.shouldShowError === testCase.expectedError;

		console.log(`${index + 1}. ${testCase.name}:`);
		console.log(`   New: "${testCase.newPassword}"`);
		console.log(`   Confirm: "${testCase.confirmPassword}"`);
		console.log(`   Expected error: ${testCase.expectedError}`);
		console.log(`   Actual error: ${result.shouldShowError}`);
		console.log(`   Match: ${result.match}`);
		console.log(`   Both filled: ${result.bothFilled}`);
		console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
	});

	// Test Cyrillic detection
	console.log('🔤 Testing Cyrillic Detection:');
	const cyrillicTests = [
		{ text: 'password123', expected: false },
		{ text: 'пароль123', expected: true },
		{ text: 'passwordпароль', expected: true },
		{ text: 'test', expected: false },
		{ text: 'тест', expected: true },
		{ text: 'test123тест', expected: true },
	];

	function checkCyrillic(text) {
		return /[а-яё]/i.test(text);
	}

	cyrillicTests.forEach((test, index) => {
		const result = checkCyrillic(test.text);
		const passed = result === test.expected;

		console.log(
			`${index + 1}. "${test.text}": ${
				result === test.expected ? '✅ PASS' : '❌ FAIL'
			} (expected: ${test.expected}, got: ${result})`
		);
	});
}

testPasswordValidation();

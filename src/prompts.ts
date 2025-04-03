export const generateTestsPrompt = (params: Record<string, string>) => `
# TASK:
You are provided with one or more Go source files belonging to the same package. Your objective is to generate a complete _test.go file that offers comprehensive test coverage for the package. Follow the guidelines below exactly:

1. Identify all exported functions and methods within the provided source files.
2. Create test functions for each exported function or method. Name each function as "Test[FunctionName]" following Go naming conventions.
3. For every function or method, include test cases that cover:
   - The expected ("happy path") scenario.
   - Relevant edge cases.
   - Error conditions, where applicable.
4. Import the "testing" package and any other necessary built-in packages already utilized in the source files. Do not include any external libraries unless they are already present in the source files.
5. Organize the tests for clarity:
   - Group related test cases together.
   - Use clear sectioning and comments within the code.
6. Add descriptive inline comments for each test explaining the purpose and expected outcome.
7. Use appropriate Go testing assertions to compare expected outputs against actual results.
8. Follow Go best practices for test file structure, naming conventions, and code readability.

${ params?.haveTests ? extendTestsPrompt : ''}

# GO SOURCES FILE
${params?.sourceFiles}

# IMPORTANT:
- Output only the _test.go source code without any extra explanation or commentary.
- The final output must be formatted as a JSON object with the following structure:
\`\`\`
{ "code": <source_code>, "fileName": "<package_name>_test.go"}
\`\`\`
NOTE: Make sure to include the FULL PATH for fileName
${ params?.haveTests ? extendTestsOutputPrompt : ''}
`;

export const extendTestsPrompt = `
For this specific package a set of existing _test.go files is included.
Please carefully analyze the source code of them and make sure to:
1. Determine which function of the packages is already being tested
2. Determine if the more tests cases should be added to the already existing tests functions
3. If so, create new functions which are more comprehensive and correct.
4. Once you asserted that these tests are correct, focus on the code from the package source files which is not yet being tested in the _test.go files
\`\`\`
`

export const extendTestsOutputPrompt = `
BE CAREFUL: if there is already a test file called <package_name>_test.go, then make sure to append your new produced code to that file.
So your output must be THAT FILE CONTENT + YOUR NEW GENERATED CONTENT.
`
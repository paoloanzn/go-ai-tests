export const generateTestsPrompt = (params: Record<string, string>) => `
# TASK
You will be given a set of Go source file(one or more) belonging to the same package.
Your job is to write a comprehensive test file following these requirements:

1. Create test functions for all exported functions and methods in the source files
2. Name each test function as "Test[FunctionName]" following Go conventions
3. Import the "testing" package and any other necessary packages but NO EXTERNAL LIB UNLESS YOU SEE THEY ARE ALREADY BEING USED IN THE SOURCE FILES(meaning they are already installed)
5. Test both happy paths and edge cases for each function
6. Include tests for error conditions where applicable
7. Ensure proper assertion of expected outputs against actual results
8. Add clear, descriptive comments explaining the purpose of each test
9. Follow Go best practices for test organization and readability

The output should be a complete, _test.go file that provides thorough test coverage.

${ params?.haveTests ? extendTestsPrompt : ''}

# GO SOURCES FILE
${ params?.sourceFiles }

# IMPORTANT
OUTPUT ONLY THE _test.go SOURCE CODE, DO NOT ADD ANYTHING ELSE
THE OUTPUT SHOULD BE IN THE FOLLOWING JSON FORMAT:
\`\`\`
{ "code": <source_code>, "fileName": "<package_name>_test.go"}
\`\`\`
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
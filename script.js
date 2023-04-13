/**
 * 1 - Create expression with no spaces.
 * 2 - Take single letters -> (A, B, C).
 * 3 - Take not single letters -> (!A, !B).
 * 4 - Take expressions inside parentheses -> (AvB)vA.
 * 5 - Take all operations that need to be done
 *     including the operators to make operations
 *     in order. -> A, B, !A, !B, A v !C...
 * 6 - Set boolean values to single letters and then make
 *     the operations.
 * 7 -
 */
const expressionInput = document.getElementById("expression");
const handleSubmit = (evt) => {
    evt.preventDefault();
    run();
};
function run() {
    const expression = expressionInput.value.replaceAll("!", "¬");
    const expressionNoSpace = expression.split(" ").join("").split("");
    const invertedExpressionNoSpace = invertExpression();
    console.log(invertedExpressionNoSpace);
    if (!checkExpression()) {
        const truthTableDiv = document.getElementById("truth-table");
        truthTableDiv.textContent = "";
        throw new Error("Error. The expression is invalid.");
    }
    const letters = takeLetters();
    const notLetters = takeNotLetters();
    const parenthesesExp = takeParenthesesExpressions();
    const notParenthesesExp = parenthesesExp.filter(exp => exp[0] === "¬"); // Only to test purposes
    const allOperations = takeOperations();
    console.log("Letters: ");
    console.log(letters);
    console.log("Not Letters: ");
    console.log(notLetters);
    console.log("Expressions in Parentheses: ");
    console.log(parenthesesExp);
    console.log("Not Expressions in Parentheses: ");
    console.log(notParenthesesExp);
    console.log("All operations: ");
    console.log(allOperations);
    const truthTable = createRows();
    console.log(truthTable);
    function checkExpression() {
        const openParentheses = Array.from(expression).filter(value => value == '(').length;
        const closeParentheses = Array.from(expression).filter(value => value == ')').length;
        if (openParentheses !== closeParentheses) {
            return false;
        }
        for (let i = 0; i < expressionNoSpace.length; i++) {
            // If there's 2 logical operators in sequence (v^ or ^v or vv)
            if (expressionNoSpace[i].match(/[v^]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[v^]/g)) {
                return false;
            }
            // If there's 2 variables in sequence (AB v B)
            if (expressionNoSpace[i].match(/[A-Z]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/g)) {
                return false;
            }
            // If there is an opening and closing parentheses after (A v ())
            if (expressionNoSpace[i] === '(' && expressionNoSpace[i + 1] && expressionNoSpace[i + 1] === ')') {
                return false;
            }
        }
        return true;
    }
    // Invert expression to perform operations from right to left
    function invertExpression() {
        let actual = "";
        let inverseExpression = [];
        let openParentheses = 0;
        for (let i = 0; i < expressionNoSpace.length; i++) {
            actual += expressionNoSpace[i];
            if (expressionNoSpace[i] === "(") {
                openParentheses++;
                continue;
            }
            if (expressionNoSpace[i] === ")") {
                openParentheses--;
            }
            // Detects if next char is "-" indicating "->"
            if (["¬", "-", ">"].includes(expressionNoSpace[i]) || expressionNoSpace[i + 1] === "-") {
                continue;
            }
            if (openParentheses === 0) {
                inverseExpression.push(actual);
                actual = "";
            }
        }
        return inverseExpression.reverse().join("").split("");
    }
    /**
    * Returns array of unique variables in found order.
    */
    function takeLetters() {
        let letters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[A-Z]/)) {
                if (!letters.includes(expressionNoSpace[i]) && !expressionNoSpace[i].match(/[v^]/g)) {
                    letters.push(expressionNoSpace[i]);
                }
            }
        }
        return letters;
    }
    ;
    /**
     * Returns array of unique variables with "¬" before (negation).
     */
    function takeNotLetters() {
        let notLetters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "¬" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                let actual = "¬";
                actual += expressionNoSpace[i + 1];
                if (!notLetters.includes(actual)) {
                    notLetters.push(actual);
                }
            }
        }
        return notLetters;
    }
    ;
    /**
     * Returns indexes array of where the characters were found.
     * @param char - Character to be found.
     */
    function takeIndexs(char) {
        let indexs = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }
    /**
     * Returns expressions within parentheses, from innermost to outermost.
     */
    function takeParenthesesExpressions() {
        const openParenthesesIndexs = takeIndexs('(').reverse();
        let parenthesesExpressions = [];
        for (let x of openParenthesesIndexs) {
            let actual = '';
            let openParentheses = 0;
            for (let i = x;; i++) {
                if (expressionNoSpace[i - 1] === "¬" && expressionNoSpace[i] === '(' && i === x) {
                    actual += "¬";
                }
                actual += expressionNoSpace[i];
                expressionNoSpace[i] === "(" ? openParentheses++ : '';
                expressionNoSpace[i] === ")" ? openParentheses-- : '';
                if (expressionNoSpace[i] === ')' && openParentheses === 0) {
                    if (checkParenthesesExpression(actual)) {
                        parenthesesExpressions.push(actual);
                        break;
                    }
                    break;
                }
            }
        }
        return parenthesesExpressions;
    }
    /**
     * Returns array with separated operations from expression.
     * Separate operations using invertedExpressionNoSpace.
     */
    function takeOperations() {
        var _a;
        let allOperations = [];
        let actual = "";
        let openParentheses = 0;
        let toPush = false;
        for (let i = 0; i < invertedExpressionNoSpace.length; i++) {
            actual += invertedExpressionNoSpace[i];
            // To track parentheses
            invertedExpressionNoSpace[i] === "(" ? openParentheses++ : '';
            invertedExpressionNoSpace[i] === ")" ? openParentheses-- : '';
            // To check "¬" or remaining operation
            if (invertedExpressionNoSpace[i] === "¬" && actual === "") {
                continue;
            }
            if (openParentheses === 0) {
                // 1 - Previous element is operator
                // 2 - Actual character is a uppercase letter
                // For simple expressions like -> AvB
                if (i > 0 && invertedExpressionNoSpace[i - 1].match(/[v^]/g) && invertedExpressionNoSpace[i].match(/[A-Z]/g)) {
                    toPush = true;
                }
                // 1 - i > 0
                // 2 - There is a element operator 2 characters before
                // 3 - Previous character is a negation operator
                // 4 - Actual character is a uppercase letter
                // For simple expressions including the negation operator -> Av¬B
                if (i > 0 && ((_a = invertedExpressionNoSpace[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[v^]/g)) && invertedExpressionNoSpace[i - 1] === "¬" && invertedExpressionNoSpace[i].match(/[A-Z]/g)) {
                    toPush = true;
                }
                if (toPush) {
                    // If begins with operator, move operator to the end.
                    if (actual[0].match(/[v^]/g)) {
                        let operator = actual[0];
                        let newActual = actual.slice(actual.indexOf(operator) + 1);
                        actual = newActual + operator;
                    }
                    else {
                        const operations = splitOperation(actual);
                        actual = operations[2] + operations[1] + operations[0];
                    }
                    allOperations.push(actual);
                    toPush = false;
                    actual = "";
                }
            }
        }
        return allOperations;
    }
    /**
     * Create rows using arrays with the variable followed by his boolean values.
     * 1 - Create boolean values for each letter in letters.
     * 2 - Create boolean values for each letter negated in notLetters.
     * 3 - Create boolean values for each expression inside parentheses.
     * 4 - Create boolean values for each expression negated inside notParentheses.
     */
    function createRows() {
        const cases = Math.pow(2, letters.length);
        let truthTable = [];
        // For each letter
        for (let i = 0; i < letters.length; i++) {
            let actual = [letters[i], []];
            // If first letter
            if (i === 0) {
                for (let x = 0; x < cases; x++) {
                    if (x % 2 === 0) {
                        actual[1].push(true);
                    }
                    else {
                        actual[1].push(false);
                    }
                }
            }
            else {
                const maxTrack = (Math.pow(2, (i + 1))) / 2;
                let actualTrack = 0;
                let actualBool = true;
                for (let x = 0; x < cases; x++) {
                    if (actualTrack == maxTrack) {
                        actualTrack = 0;
                        actualBool = actualBool ? false : true;
                    }
                    actualTrack++;
                    actual[1].push(actualBool);
                }
            }
            truthTable.push(actual);
        }
        // For each notLetter
        for (let i = 0; i < notLetters.length; i++) { // For letter in notLetters
            let actual = [notLetters[i], []]; // Set actual array to be pushed to truthTable
            let letterIndex = 0; // Take first number that is index of array containing all values of the letter
            // Return the index of a letter in truthTable to access his boolean values
            let letter = notLetters[i].replace("¬", "");
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === letter) {
                    letterIndex = i;
                    break;
                }
            }
            // For booleans values in given letter
            for (let i = 0; i < cases; i++) {
                let boolValue = truthTable[letterIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }
        // For each expression inside parentheses.
        // If expression begins with "¬",
        // remove "¬" and parentheses.
        for (let i = 0; i < parenthesesExp.length; i++) {
            let actualExp = parenthesesExp[i];
            // Remove initial "¬"
            if (actualExp[0] === "¬") {
                actualExp = actualExp.slice(1);
            }
            addVariableToTruthTable(actualExp.slice(1, -1));
        }
        // For each expression inside parentheses that is negated.
        // First will look for the expression in truthTable and then
        // invert the booleean values.
        const notExpressions = parenthesesExp.filter(exp => exp[0] === "¬"); // Filter only negations
        for (let i = 0; i < notExpressions.length; i++) {
            let actual = [notExpressions[i], []]; // Set actual array to be pushed to truthTable
            let expressionIndex = 0; // Index of expression in truthTable
            // Return the index of a expression in truthTable to access his boolean values
            let expression = notExpressions[i];
            expression = expression.replace(expression[0], "").slice(1, -1); // Remove "¬" and parentheses
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === expression) {
                    expressionIndex = i;
                    break;
                }
            }
            // For booleans values from expression
            for (let i = 0; i < cases; i++) {
                let boolValue = truthTable[expressionIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }
        // For each operation
        for (let i = 0; i < allOperations.length; i++) {
            let operation = allOperations[i];
            if (operation[0] === "(" && operation[operation.length - 1] === ")") {
                operation = operation.slice(1, -1);
            }
            let inTruthTable = truthTable.some((element) => {
                return operation === element[0];
            });
            if (inTruthTable) {
                break;
            }
            addVariableToTruthTable(allOperations[i]);
        }
        return truthTable;
        /**
         * Receive operation and then make all necessary steps to
         * make operation and set to truthTable array.
         * It's not used to process letters and notLetters.
         */
        function addVariableToTruthTable(operation) {
            let operationToDisplay = operation;
            // If last char of "operation" is operator, add previous operation to string.
            if (operation[operation.length - 1].match(/[v^]/g)) {
                operationToDisplay = operation + truthTable[truthTable.length - 1][0]; // To display less parentheses inserted by algorithm
                operation = operation + "(" + truthTable[truthTable.length - 1][0] + ")";
            }
            console.log(operation);
            let actual = [operationToDisplay, []]; // Set array to the operation
            let operationArray = splitOperation(operation); // Split expression
            const [firstVar, operator, secondVar] = operationArray; // Takes expression's elements
            let firstVarValues = getValuesTruthTable(firstVar, truthTable);
            let secondVarValues = getValuesTruthTable(secondVar, truthTable);
            // Generate conditionals results for each case and store to actual[1]
            for (let i = 0; i < cases; i++) {
                let actualValueCase = false;
                if (operator === 'v') {
                    if (firstVarValues[i] || secondVarValues[i]) {
                        actualValueCase = true;
                    }
                    else {
                        actualValueCase = false;
                    }
                }
                if (operator === '^') {
                    if (firstVarValues[i] && secondVarValues[i]) {
                        actualValueCase = true;
                    }
                    else {
                        actualValueCase = false;
                    }
                }
                actual[1].push(actualValueCase);
            }
            truthTable.push(actual);
        }
    }
    /**
     * Returns the array containing separately the variables and operator from operation.
     */
    function splitOperation(operation) {
        let operationArray = [];
        let actual = '';
        let openParentheses = 0;
        // To split values
        for (let i = 0; i < operation.length; i++) {
            operation[i] === "(" ? openParentheses++ : "";
            operation[i] === ")" ? openParentheses-- : "";
            actual += operation[i];
            if (operation[i] === "¬" || openParentheses > 0) {
                continue;
            }
            operationArray.push(actual);
            actual = "";
        }
        return operationArray;
    }
    /**
     * Returns the boolean values of the given variable.
     */
    function getValuesTruthTable(variable, truthTable) {
        let index = 0;
        if (variable[0] === "(" && variable[variable.length - 1] === ")") {
            variable = variable.slice(1, -1);
        }
        for (let i = 0; i < truthTable.length; i++) {
            if (truthTable[i][0] === variable) {
                index = i;
                break;
            }
        }
        return truthTable[index][1];
    }
    /**
     * Return true if expression inside parentheses isn't only a variable
     */
    function checkParenthesesExpression(expression) {
        expression[0] === "¬" ? expression = expression.replace(expression[0], "") : ""; // Remove "¬" if this is the first char in expression
        const slicedOperation = splitOperation(expression.slice(1, -1)); // Remove parantheses
        return slicedOperation.length !== 3 ? false : true;
    }
    const truthTableDiv = document.getElementById("truth-table");
    if (truthTableDiv) {
        truthTableDiv.children ? truthTableDiv.textContent = "" : "";
        const table = document.createElement("table");
        table.id = "the-table";
        table.style.opacity = '0';
        // Table's header
        const tableHeaderElement = document.createElement("thead");
        const headerRow = document.createElement("tr");
        for (let x of truthTable) {
            const labelHeader = document.createElement("th");
            labelHeader.textContent = x[0]; // Variable
            headerRow.appendChild(labelHeader);
        }
        tableHeaderElement.appendChild(headerRow);
        table.appendChild(tableHeaderElement);
        const tableBodyElement = document.createElement("tbody");
        // Table's boolean values from expressions
        const cases = Math.pow(2, letters.length);
        // Create a row for body for each case
        for (let i = 0; i < cases; i++) {
            const bodyRow = document.createElement("tr");
            // For each variable in truth table
            for (let x of truthTable) {
                const actualBooleanCell = document.createElement("td");
                // Convert boolean value to string and then take only the first letter to uppercase
                actualBooleanCell.textContent = (new Boolean(x[1][i]).toString()[0]).toUpperCase();
                if (x[1][i]) {
                    actualBooleanCell.className = "true";
                }
                else {
                    actualBooleanCell.className = "false";
                }
                bodyRow.appendChild(actualBooleanCell);
            }
            tableBodyElement.appendChild(bodyRow);
        }
        table.appendChild(tableBodyElement);
        truthTableDiv.appendChild(table);
        setTimeout(() => {
            table.style.opacity = "1";
        }, 100);
    }
}
//# sourceMappingURL=script.js.map
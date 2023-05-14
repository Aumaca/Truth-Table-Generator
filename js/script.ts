/**
 * 1 - Receives expression input.
 * 
 * 2 - Create expression with no spaces.
 * 
 * 3 - Invert expression using function, to take operations from right to left.
 * 
 * 4 - Check if the expression is correct.
 * 
 * 5 - Take single letters -> (A, B, C).
 * 
 * 6 - Take not single letters -> (!A, !B).
 * 
 * 7 - Take expressions within parentheses (being negated or not) -> (AvB)vA.
 * 
 * 9 - Take all operations that need to be done,
 *     including the operators to make operations
 *     in order. -> A, B, !A, !B, A v !C...
 * 
 * 10 - Set boolean values to single letters and then make the necessary steps
 *      to accomplish all operations.
 * 
 * 11 - Display to user including the data to HTML.
 */

const expressionInput = document.getElementById("expression") as HTMLInputElement;
const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    run();
};

function run(): void {
    const expression: string = expressionInput.value.replaceAll("!", "¬");
    const expressionNoSpace: string = expression.split(" ").join("");
    const invertedExpressionNoSpace: string = invertExpression(expressionNoSpace);
    if (!checkExpression()) {
        const truthTableDiv: HTMLElement = document.getElementById("truth-table");
        truthTableDiv.textContent = "";
        alert("Error. The expression is invalid.");
        throw new Error("Error. The expression is invalid.");
    }
    const letters: string[] = takeLetters();
    const notLetters: string[] = takeNotLetters();
    const parenthesesExp: string[] = takeParenthesesExpressions(expressionNoSpace);
    const notParenthesesExp: string[] = parenthesesExp.filter(exp => exp[0] === "¬"); // For tests purpose
    const allOperations: string[] = takeOperations(invertedExpressionNoSpace);
    console.log("Inverted expression: ");
    console.log(invertedExpressionNoSpace);
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
    const truthTable: [string, boolean[]][] = createRows();
    console.log("truthTable: ");
    console.log(truthTable);

    function checkExpression(): boolean {
        const openParentheses: number = Array.from(expression).filter(value => value == '(').length;
        const closeParentheses: number = Array.from(expression).filter(value => value == ')').length;
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

    /**
     * Returns the inverted expression of an given expression.
     * Operations within parentheses are not inverted.
     * Conditional operator "->" isn't inverted to ">-".
     * @param expression
     */
    function invertExpression(expression: string): string {
        let actual: string = "";
        let inverseExpression: string[] = [];
        let openParentheses: number = 0;
        for (let i = 0; i < expression.length; i++) {
            actual += expression[i];
            if (expression[i] === "(") {
                openParentheses++;
                continue;
            }
            if (expression[i] === ")") {
                openParentheses--;
            }
            // Detects if next char is "-" indicating "->"
            if (["¬", "-"].includes(expression[i])) {
                continue;
            }
            if (openParentheses === 0) {
                inverseExpression.push(actual);
                actual = "";
            }
        }
        return inverseExpression.reverse().join("");
    }

    /**
     * Return a new expression with AND operations surrounded by parentheses
     * OR a array with the AND operations.
     * @param expression - Inverted expression.
     * @param toReturn - "newExpression" to return a newExpression or "operations" to return array containing the operations
     */
    function TakeAndOperations(expression: string, toReturn: string): string[] {
        let newExpression: string[] = Array.from(expression);
        let andOperations: string[] = [];
        let actual: string = "";
        let openParentheses: number = 0;
        let toPush: boolean = false;

        for (let i = 0; i < expression.length; i++) {

            actual += expression[i];
            expression[i] === "(" ? openParentheses++ : '';
            expression[i] === ")" ? openParentheses-- : '';

            if (expression[i] === "¬" || openParentheses > 0) {
                continue;
            }

            // For expressions that begins with a operator
            if (actual[0].match(/[v^]/g) && actual[1]) {
                toPush = true;
            }

            // For simple expressions including the negation operator -> Av¬B
            // 1 - There is a element operator 2 characters before
            // 2 - Previous character is a negation operator
            // 3 - Actual character is a uppercase letter
            if (expression[i - 2]?.match(/[v^]/g) && expression[i - 1] === "¬" && expression[i]?.match(/[A-Z]/g)) {
                toPush = true;
            }

            if (splitOperation(actual).length === 3) {
                toPush = true;
            }

            if (toPush === true) {
                const operations = splitOperation(actual);
                if (operations[1] === "^") {
                    andOperations.push(actual);
                    actual = "";
                } else {
                    actual = operations[operations.length - 1]; // Last variable
                }
                toPush = false;
            }
        }

        let charsToSkip: number = 0;
        for (let i = 0; i < andOperations.length; i++) {
            const beginIndex: number = expression.indexOf(andOperations[i]) + charsToSkip;
            const endIndex: number = andOperations[i].length + beginIndex + 1;
            newExpression.splice(beginIndex, 0, "(");
            newExpression.splice(endIndex, 0, ")");
            // The expression argument is inverted, so the operation within parentheses will be
            // inverted to check after if operation was already done in truthTable.
            newExpression = newExpression.join("").replace(andOperations[i], invertExpression(andOperations[i])).split("");
            charsToSkip += 2;
        }
        if (toReturn === "newExpression") {
            return newExpression;
        }
        if (toReturn === "operations") {
            return andOperations;
        }
    }

    /**
     * Return a array containing conditional operations.
     * @param expression - Inverted expression.
     */
    function takeConditionals(exp: string[]): string[] {
        let newExp: string[] = invertExpression(exp.join("")).split("");
        let conditionals: string[] = [];
        let condIndexs: number[] = [];

        let openParentheses: number = 0;
        newExp.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === ">" && openParentheses === 0 ? condIndexs.push(i) : "";
        });

        let cuttedOpLength: number = 0;
        for (let i = 0; i < condIndexs.length; i++) {
            let actualCondIndex: number = condIndexs[i] - cuttedOpLength;
            const leftOp: string = newExp.slice(0, actualCondIndex - 1).join("");
            const rightOp: string = newExp.slice(actualCondIndex + 1).join("");
            cuttedOpLength += leftOp.length + 2; // +2 due the operator "->"
            let actual: string = `(${leftOp})->(${rightOp})`;
            conditionals.unshift(actual);
            newExp = newExp.slice(actualCondIndex + 1);
        }
        console.log("conditionals: ");
        console.log(conditionals);
        return conditionals;
    }

    /**
     * Gets all individual variables (letters) of the expression.
     */
    function takeLetters(): string[] {
        let letters: string[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[A-Z]/)) {
                if (!letters.includes(expressionNoSpace[i]) && !expressionNoSpace[i].match(/[v^]/g)) {
                    letters.push(expressionNoSpace[i]);
                }
            }
        }
        letters = letters.sort();
        return letters;
    };

    /**
     * Gets all individual variables (letters) of the expression with a negation operator ("¬") before.
     */
    function takeNotLetters(): string[] {
        let notLetters: string[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "¬" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                if (!notLetters.includes(expressionNoSpace[i + 1])) {
                    notLetters.push(expressionNoSpace[i + 1]);
                }
            }
        }
        notLetters = notLetters.sort().map((letter: string) => {
            return "¬" + letter;
        });
        return notLetters;
    };

    /**
     * Returns indexes array of where the characters were found.
     * @param char - Character to be found.
     * @param expressionNoSpace - Expression's array without spaces.
     */
    function takeIndexs(char: string, expressionNoSpace: string[]): number[] {
        let indexs: number[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }

    /**
     * Returns expressions within parentheses, from innermost to outermost.
     * @param expression - Expression in array without space
     */
    function takeParenthesesExpressions(expressionNoSpace: string): string[] {
        const openParenthesesIndexs: number[] = takeIndexs('(', expressionNoSpace.split("")).reverse();
        let parenthesesExpressions: string[] = [];
        for (let x of openParenthesesIndexs) {
            let actual: string = '';
            let openParentheses: number = 0;
            for (let i = x; ; i++) {
                if (expressionNoSpace[i - 1] === "¬" && expressionNoSpace[i] === '(' && i === x) {
                    actual += "¬";
                }
                actual += expressionNoSpace[i];
                expressionNoSpace[i] === "(" ? openParentheses++ : '';
                expressionNoSpace[i] === ")" ? openParentheses-- : '';
                if (expressionNoSpace[i] === ')' && openParentheses === 0) {
                    parenthesesExpressions.push(actual);
                    break;
                }
            }
        }
        return parenthesesExpressions;
    }

    /**
     * To remove operators like "->", "<->", "=", to take operations more easily.
     * Removing them result in an array with separate operations that will be handled by the takeOperations().
     * @param expression - Inverted expression.
     */
    function removeSomeOperators(expression: string[]): string[] {
        let newExp: string[] = [];
        if (!expression.includes("-") && !expression.includes("=")) {
            return expression;
        }
        // Invert to normal the expression from argument.
        expression = invertExpression(expression.join("")).split("");
        let condIndexs: number[] = [];
        let openParentheses: number = 0;
        expression.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === ">" && openParentheses === 0 ? condIndexs.push(i) : "";
        });
        let cuttedOpLength: number = 0;
        condIndexs.map((i) => {
            i -= cuttedOpLength;
            let toPushExp: string = expression.slice(0, i - 1).join("");
            if (toPushExp.length > 1) {
                newExp.push(invertExpression(toPushExp));
            }
            cuttedOpLength += toPushExp.length + 2;
            expression = expression.slice(i + 1);
            if (!expression.includes("-")) {
                newExp.push(invertExpression(expression.join("")));
            }
        });
        return newExp;
    }

    /**
     * Returns array with separated operations from expression.
     * @param expression - Inverted expression
     */
    function takeOperations(expression: string): string[] {
        let allOperations: string[] = [];
        let actual: string = "";
        let openParentheses: number = 0;
        let toPush: boolean = false;

        // New expression in which AND operations are surrounded by parentheses.
        let newExpression: string[] = TakeAndOperations(expression, "newExpression");

        // Array with only AND operations
        let andOperations: string[] = TakeAndOperations(expression, "operations");

        // Array with only CONDITIONAL operations
        let localConditionalOperations: string[] = takeConditionals(expression.split(""));

        // Adds AND operations first
        andOperations.map((operation) => {
            allOperations.push(invertExpression(operation));
        });

        // If expression has operators as "-", "=" and etc, get array with operations separated in array.
        if (newExpression.includes("-")) {
            newExpression = removeSomeOperators(newExpression);
            newExpression.map((exp) => {
                makeOp(exp.split(""));
            })
        } else {
            makeOp(newExpression);
        }

        // Add in the end the CONDITIONAL operations
        localConditionalOperations.map((operation) => {
            allOperations.push(operation);
        });

        function makeOp(expression: string[]): void {
            for (let i = 0; i < expression.length; i++) {
                actual += expression[i];

                // To track parentheses
                expression[i] === "(" ? openParentheses++ : '';
                expression[i] === ")" ? openParentheses-- : '';

                // To check "¬" or remaining operation
                if (expression[i] === "¬" || openParentheses > 0) {
                    continue;
                }

                // For expressions that begins with a operator
                if (actual[0].match(/[v^]/g) && actual[1]) {
                    toPush = true;
                }

                // For simple expressions including the negation operator -> Av¬B
                // 1 - There is a element operator 2 characters before
                // 2 - Previous character is a negation operator
                // 3 - Actual character is a uppercase letter
                if (expression[i - 2]?.match(/[v^]/g) && expression[i - 1] === "¬" && expression[i]?.match(/[A-Z]/g)) {
                    toPush = true;
                }

                // For expression that form an operation
                if (splitOperation(actual).length === 3) {
                    toPush = true;
                }

                if (toPush === true) {
                    // If begins with operator, move operator to the end.
                    if (actual[0].match(/[v^]/g)) {
                        let operator: string = actual[0];
                        let newActual: string = actual.slice(actual.indexOf(operator) + 1);
                        actual = newActual + operator;
                    } else {
                        const operations = splitOperation(actual);
                        actual = operations[2] + operations[1] + operations[0];
                    }
                    toPush = false;
                    allOperations.push(actual);
                    actual = "";
                }
            }
        }
        return allOperations;
    }

    /**
     * Create rows using arrays with the variable followed by his boolean values.
     * 1 - Create boolean values for each letter in letters.
     * 2 - Create boolean values for each letter in notLetters.
     * 3 - Create boolean values for each expression within parentheses.
     * 4 - Create boolean values for each expression within parentheses with negation.
     * 5 - Create boolean values for each operation in allOperations.
     */
    function createRows(): [string, boolean[]][] {
        const cases: number = 2 ** letters.length;
        let truthTable: [string, boolean[]][] = [];

        // For each letter
        for (let i = 0; i < letters.length; i++) {
            let actual: [string, boolean[]] = [letters[i], []];
            // If first letter
            if (i === 0) {
                for (let x = 0; x < cases; x++) {
                    if (x % 2 === 0) {
                        actual[1].push(true);
                    } else {
                        actual[1].push(false);
                    }
                }
            } else {
                const maxTrack: number = (2 ** (i + 1)) / 2;
                let actualTrack: number = 0;
                let actualBool: boolean = true;
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
            let actual: [string, boolean[]] = [notLetters[i], []]; // Set actual array to be pushed to truthTable
            let letterIndex: number = 0; // Take first number that is index of array containing all values of the letter

            // Return the index of a letter in truthTable to access his boolean values
            let letter: string = notLetters[i].replace("¬", "");
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === letter) {
                    letterIndex = i;
                    break;
                }
            }

            // For booleans values in given letter
            for (let i = 0; i < cases; i++) {
                let boolValue: boolean = truthTable[letterIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }

        // For each expression within parentheses.
        // If expression begins with "¬",
        // remove "¬" and parentheses.
        for (let i = 0; i < parenthesesExp.length; i++) {
            let actualExp: string = parenthesesExp[i];
            // Remove initial "¬" to negation operation after
            if (actualExp[0] === "¬") {
                actualExp = actualExp.slice(1);
            }
            // Remove parentheses
            actualExp = actualExp.slice(1, -1);
            const actualExpInverted: string = invertExpression(actualExp);
            const operations = takeOperations(actualExpInverted);
            for (let x of operations) {
                addVariableToTruthTable(x);
            }
            if (parenthesesExp[i][0] === "¬") {
                let actual: [string, boolean[]] = [parenthesesExp[i], []]; // Set actual array to be pushed to truthTable
                // For booleans values from expression
                for (let i = 0; i < cases; i++) {
                    let boolValue: boolean = truthTable[truthTable.length - 1][1][i];
                    boolValue === true ? actual[1].push(false) : actual[1].push(true);
                }
                truthTable.push(actual);
            }
        }


        // For each operation
        for (let i = 0; i < allOperations.length; i++) {
            let operation: string = allOperations[i];
            if (operation[0] === "(" && operation[operation.length - 1] === ")") {
                operation = operation.slice(1, -1);
            }
            let inTruthTable: boolean = truthTable.some((element) => {
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
         * make the operation and set to truthTable array.
         * It's not used to process letters and notLetters.
         */
        function addVariableToTruthTable(operation: string): void {
            // If last char of "operation" is operator, add previous operation to operation.
            if (operation[operation.length - 1].match(/[v^]/g)) {
                operation = operation + "(" + truthTable[truthTable.length - 1][0] + ")";
            }

            let operationArray: string[] = splitOperation(operation);
            let [firstVar, operator, secondVar] = operationArray;

            let operationToDisplay: string[] = operationArray;
            if (firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")") {
                if (!parenthesesExp.includes(firstVar)) {
                    operationToDisplay[0] = firstVar = firstVar.slice(1, -1);
                }
            }
            if (secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")") {
                if (!parenthesesExp.includes(secondVar)) {
                    operationToDisplay[2] = secondVar = secondVar.slice(1, -1);
                }
            }

            let actual: [string, boolean[]] = [operationToDisplay.join(""), []];
            let firstVarValues: boolean[] = getValuesTruthTable(firstVar, truthTable);
            let secondVarValues: boolean[] = getValuesTruthTable(secondVar, truthTable);
            for (let i = 0; i < cases; i++) {
                let actualValueCase: boolean = false;
                if (operator === 'v') {
                    if (firstVarValues[i] || secondVarValues[i]) {
                        actualValueCase = true;
                    } else {
                        actualValueCase = false;
                    }
                }
                if (operator === '^') {
                    if (firstVarValues[i] && secondVarValues[i]) {
                        actualValueCase = true;
                    } else {
                        actualValueCase = false;
                    }
                }
                if (operator === '->') {
                    if (firstVarValues[i] === true && secondVarValues[i] === false) {
                        actualValueCase = false;
                    } else {
                        actualValueCase = true;
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
    function splitOperation(operation: string): string[] {
        let operationArray: string[] = [];
        let actual: string = "";
        let openParentheses: number = 0;
        // To split values
        for (let i = 0; i < operation.length; i++) {
            operation[i] === "(" ? openParentheses++ : "";
            operation[i] === ")" ? openParentheses-- : "";
            actual += operation[i];
            if (["¬", "<", "-"].includes(operation[i]) || openParentheses > 0) {
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
    function getValuesTruthTable(variable: string, truthTable: [string, boolean[]][]): boolean[] {
        let index: number = 0;
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

    const truthTableDiv: HTMLElement = document.getElementById("truth-table");
    const truthTableCategoryDiv: HTMLElement = document.getElementById("truth-table-category");

    if (truthTableDiv) {
        truthTableDiv.children ? truthTableDiv.textContent = "" : "";
        truthTableCategoryDiv.children ? truthTableCategoryDiv.textContent = "" : "";
        const table: HTMLTableElement = document.createElement("table");
        table.id = "the-table";
        table.style.opacity = '0';

        // Table's header
        const tableHeaderElement: HTMLTableSectionElement = document.createElement("thead");
        const headerRow: HTMLTableRowElement = document.createElement("tr");
        for (let x of truthTable) {
            const labelHeader: HTMLTableCellElement = document.createElement("th");
            labelHeader.textContent = x[0]; // Variable
            headerRow.appendChild(labelHeader);
        }
        tableHeaderElement.appendChild(headerRow);
        table.appendChild(tableHeaderElement);

        const tableBodyElement: HTMLTableSectionElement = document.createElement("tbody");
        // Table's boolean values from expressions
        const cases: number = 2 ** letters.length;
        // Create a row for body for each case
        for (let i = 0; i < cases; i++) {
            const bodyRow: HTMLTableRowElement = document.createElement("tr");
            // For each variable in truth table
            for (let x of truthTable) {
                const actualBooleanCell: HTMLTableCellElement = document.createElement("td");
                // Convert boolean value to string and then take only the first letter to uppercase
                actualBooleanCell.textContent = (new Boolean(x[1][i]).toString()[0]).toUpperCase();
                if (x[1][i]) {
                    actualBooleanCell.className = "true";
                } else {
                    actualBooleanCell.className = "false";
                }
                bodyRow.appendChild(actualBooleanCell);
            }
            tableBodyElement.appendChild(bodyRow);
        }
        table.appendChild(tableBodyElement);
        truthTableDiv.appendChild(table);

        // To display if expression results in a Tautology or Contradiction
        const paragraph: HTMLParagraphElement = document.createElement("h4");
        const lastColumnBooleanValues: boolean[] = truthTable[truthTable.length - 1][1];
        if (lastColumnBooleanValues.every((bool) => bool === true)) {
            paragraph.textContent = "Tautology";
            paragraph.className = "tautology";
        } else {
            if (lastColumnBooleanValues.every((bool) => bool === false)) {
                paragraph.textContent = "Contradiction";
                paragraph.className = "contradiction";
            } else {
                paragraph.textContent = "Contingency";
                paragraph.className = "contingency";
            }
        }


        truthTableCategoryDiv.appendChild(paragraph);

        setTimeout(() => {
            table.style.opacity = "1";
            truthTableCategoryDiv.style.opacity = "1";
        }, 100);
    }
}
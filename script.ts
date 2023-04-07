const expressionInput = document.getElementById("expression") as HTMLInputElement;

const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    run();
};

function run(): void {
    const div = document.getElementsByClassName("truth-table");
    const expression: string = expressionInput.value;
    const expressionNoSpace = expression.split(" ").join("").split("");
    if (!checkExpression()) {
        throw new Error("Error. The expression is invalid.");
    }
    const letters: string[] = takeLetters();
    const notLetters: string[] = takeNotLetters();
    const parenthesesExp: string[] = takeParenthesesExpressions();
    const allOperations: string[] = takeOperations();
    console.log("Letters: ");
    console.log(letters);
    console.log("Not Letters: ");
    console.log(notLetters);
    console.log("Expressions in Parentheses: ");
    console.log(parenthesesExp);
    console.log("All operations: ");
    console.log(allOperations);
    const truthTable: [string, boolean[]][] = createRows();

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
    * Returns array of unique variables in found order.
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
        return letters;
    };

    /**
     * Returns array of unique variables with "!" before (negation).
     */
    function takeNotLetters(): string[] {
        let notLetters: string[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "!" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                let actual: string = '';
                actual += expressionNoSpace[i];
                actual += expressionNoSpace[i + 1];
                if (!notLetters.includes(actual)) {
                    notLetters.push(actual);
                }
            }
        }
        return notLetters;
    };

    /**
     * Returns indexes array of where the characters were found.
     * @param char - Character to be found.
     */
    function takeIndexs(char: string): number[] {
        let indexs: number[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }


    /**
     * Returns expressions within parentheses, from innermost to outermost.
     */
    function takeParenthesesExpressions(): string[] {
        const openParenthesesIndexs: number[] = takeIndexs('(').reverse();
        console.log(openParenthesesIndexs);
        let parenthesesExpressions: string[] = [];
        
        for (let x of openParenthesesIndexs) {
            let actual: string = '';
            let openParentheses: number = 0;
            for (let i = x; ; i++) {
                if (expressionNoSpace[i - 1] === "!" && expressionNoSpace[i] === '(' && i === x) {
                    actual += "!";
                }
                actual += expressionNoSpace[i];
                expressionNoSpace[i] === "(" ? openParentheses++ : '';
                expressionNoSpace[i] === ")" ? openParentheses-- : '';
                if (expressionNoSpace[i] === ')') {
                    if (openParentheses === 0) {
                        parenthesesExpressions.push(actual);
                        break;
                    }
                }
            }
        }
        return parenthesesExpressions;
    }

    /**
     * Returns array with separated operations from expression.
     */
    function takeOperations(): string[] {
        let allOperations: string[] = [];
        let actual: string = "";
        let openParentheses: number = 0;
        // Example: AvB^(AvB)
        for (let i = 0; i < expressionNoSpace.length; i++) {

            actual += expressionNoSpace[i];

            // To track parentheses
            expressionNoSpace[i] === "(" ? openParentheses++ : '';
            expressionNoSpace[i] === ")" ? openParentheses-- : '';

            // To check "!" or remaining operation
            if (expressionNoSpace[i] === "!" || (expressionNoSpace[i].match(/[v^]/g) && actual === "")) {
                continue;
            }

            if (openParentheses === 0) {
                // If previous element is operator and [i] is a uppercase letter
                // For simple expressions like -> A v B
                if (i > 0 && expressionNoSpace[i - 1].match(/[v^]/g) && expressionNoSpace[i].match(/[A-Z]/g)) {
                    allOperations.push(actual);
                    actual = "";
                }

                // If previous element is a exclamation mark and the pre-previous is a operator and [i] is a uppercase letter
                // For simple expressions like -> A v B
                if (i > 0 && expressionNoSpace[i - 2] && expressionNoSpace[i - 2].match(/[v^]/g) && expressionNoSpace[i - 1] === "!" && expressionNoSpace[i].match(/[A-Z]/g)) {
                    allOperations.push(actual);
                    actual = "";
                }

                if (!expressionNoSpace[i + 1] && actual !== "") {
                    allOperations.push(actual);
                    actual = "";
                }
            }
        }
        return allOperations;
    }

    /**
     * Create rows using arrays with the variable followed by his boolean values.
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
                        actualBool = changeActualBool(actualBool);
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
            let letter: string = notLetters[i].replace('!', '');
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

        // For each expression inside parentheses that doesn't is negated (example: (A v B))
        const withoutNegation = parenthesesExp.filter(exp => exp[0] !== "!");
        for (let i = 0; i < withoutNegation.length; i++) {
            addVariableToTruthTable(withoutNegation[i].slice(1, -1));
        }

        // For each expression inside parentheses that is negated (example: !(A v B))
        const notExpressions: string[] = parenthesesExp.filter(exp => exp[0] === "!");
        for (let i = 0; i < notExpressions.length; i++) { // For letter in notLetters
            let actual: [string, boolean[]] = [notExpressions[i], []]; // Set actual array to be pushed to truthTable
            let expressionIndex: number = 0; // Take first number that is index of array containing all values of the letter

            // Return the index of a expression in truthTable to access his boolean values
            let expression: string = notExpressions[i].replace('!', '').replace("(", "").replace(")", "");
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === expression) {
                    expressionIndex = i;
                    break;
                }
            }

            // For booleans values in given letter
            for (let i = 0; i < cases; i++) {
                let boolValue: boolean = truthTable[expressionIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }


        // For each operation
        for (let i = 0; i < allOperations.length; i++) {
            addVariableToTruthTable(allOperations[i]);
        }
        console.log(truthTable);
        return truthTable;

        /**
         * To invert actual boolean value for takeLetters()
         */
        function changeActualBool(actualBool: boolean): boolean {
            if (actualBool) {
                return false;
            }
            return true;
        }

        /**
         * Receive operation and then make all necessary steps to
         * make operation and set to truthTable array.
         * It's not used to process letters and notLetters.
         */
        function addVariableToTruthTable(operation: string): void {
            let operationToDisplay: string = operation;
            // If first char is operator, add previous operation to string.
            if (operation[0].match(/[v^]/g)) {
                operationToDisplay = allOperations[allOperations.indexOf(operation) - 1] + operation;
                operation = `${allOperations[allOperations.indexOf(operation) - 1]}${operation}`;
            }
            let actual: [string, boolean[]] = [operationToDisplay, []]; // Set array to the operation
            let operationArray: string[] = splitOperation(operation); // Split expression
            const [firstVar, operator, secondVar] = operationArray; // Takes expression's elements
            let firstVarValues: boolean[] = getValuesTruthTable(firstVar, truthTable);
            let secondVarValues: boolean[] = getValuesTruthTable(secondVar, truthTable);
            // Generate conditionals results for each case and store to actual[1]
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
        let actual: string = '';
        let openParentheses: number = 0;
        // To split values
        for (let i = 0; i < operation.length; i++) {
            if (operation[i] === '(') {
                openParentheses++;
            }
            if (operation[i] === ')') {
                openParentheses--;
            }

            actual += operation[i];

            if (operation[i] === '!' || openParentheses > 0) {
                continue;
            }
            operationArray.push(actual);
            actual = '';
        }
        return operationArray;
    }


    /**
     * Returns the boolean values of the given variable.
     */
    function getValuesTruthTable(variable: string, truthTable: [string, boolean[]][]): boolean[] {
        let index: number = 0;
        if (variable.indexOf("(") > -1 && variable.indexOf(")") > -1) {
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
    function checkParenthesesExpression(expression: string) {
        const slicedOperation = splitOperation(expression.slice(1, -1));
        if (slicedOperation.length !== 3) {
            return false;
        }
        return true;
    }

    const truthTableDiv = document.getElementById("truth-table");

    if (truthTableDiv) {
        if (truthTableDiv.children) {
            truthTableDiv.textContent = "";
        }
        const table = document.createElement("table");

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
                actualBooleanCell.textContent = (new Boolean(x[1][i]).toString()[0]).toUpperCase();
                bodyRow.appendChild(actualBooleanCell);
            }
            tableBodyElement.appendChild(bodyRow);
        }
        table.appendChild(tableBodyElement);
        truthTableDiv.appendChild(table);
    }
}
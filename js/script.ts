class Expression {
    public defaultExp: string;
    public invertedExp: string;
    public letters: string[];
    public newInvertedExp: string;
    public parenthesesExp: string[];
    public parenthesesExpOps: string[];
    public andOps: string[];
    public orOps: string[];
    public conditionalOps: string[];
    public equivalenceOps: string[];
    public cases: number;
    public operations: string[];
    public truthTable: [string, boolean[]][];

    constructor(defaultExp: string) {
        this.defaultExp = defaultExp.replaceAll(" ", "").replaceAll("!", "¬").replaceAll("v", "∨").replaceAll("^", "∧").replaceAll("<->", "≡").replaceAll("<=>", "≡").replaceAll("=", "≡").replaceAll("->", "⇒").replaceAll("=>", "⇒");
        this.invertedExp = this.invertExpression(this.defaultExp);
        this.letters = this.getLetters();
        this.parenthesesExp = this.getParenthesesExp();
        this.parenthesesExpOps = this.getOpsFromParenthesesExp();
        this.andOps = this.getOps(this.invertedExp, "∧");
        this.newInvertedExp = this.surroundAndOps();
        this.orOps = this.getOps(this.newInvertedExp, "∨");
        this.conditionalOps = this.getConditionalOps();
        this.equivalenceOps = this.getEquivalenceOps();
        this.cases = this.getCases();
        this.operations = [...this.parenthesesExpOps, ...this.andOps, ...this.orOps, ...this.conditionalOps, ...this.equivalenceOps];
        this.truthTable = this.generateTruthTable();
    }

    private getCases(): number {
        let onlyLetters: number = 0;
        this.letters.map((letter) => {
            letter[0] !== "¬" ? onlyLetters++ : "";
        });
        return onlyLetters;
    }

    private invertExpression(defaultExp: string): string {
        let actualExp: string = "";
        let invertedExp: string[] = [];
        let openParentheses: number = 0;
        for (let i = 0; i < defaultExp.length; i++) {
            actualExp += defaultExp[i];
            if (defaultExp[i] === "(") {
                openParentheses++;
                continue;
            }
            if (defaultExp[i] === ")") {
                openParentheses--;
            }
            if (["¬"].includes(defaultExp[i])) {
                continue;
            }
            if (openParentheses === 0) {
                invertedExp.push(actualExp);
                actualExp = "";
            }
        }
        return invertedExp.reverse().join("");
    }

    private splitOp(operation: string): string[] {
        let operationArray: string[] = [];
        let actualOp: string = "";
        let openParentheses: number = 0;
        // To split values
        for (let i = 0; i < operation.length; i++) {
            operation[i] === "(" ? openParentheses++ : "";
            operation[i] === ")" ? openParentheses-- : "";
            actualOp += operation[i];
            if (["¬"].includes(operation[i]) || openParentheses > 0) {
                continue;
            }
            operationArray.push(actualOp);
            actualOp = "";
        }
        return operationArray;
    }

    private getLetters(): string[] {
        let letters: string[] = [];
        let notLetters: string[] = [];
        for (let i = 0; i < this.defaultExp.length; i++) {
            if (this.defaultExp[i].match(/[A-Z]/)) {
                if (!letters.includes(this.defaultExp[i])) {
                    letters.push(this.defaultExp[i]);
                }
                if (this.defaultExp[i - 1] === "¬") {
                    notLetters.push(this.defaultExp[i]);
                }
            }
        }
        letters = letters.sort();
        notLetters = notLetters.sort().map((x) => { return "¬" + x }) // Adds "¬" to each letter
        return [...letters, ...notLetters];
    }

    private getParenthesesExp(): string[] {
        let openParenthesesIndexs: number[] = [];
        this.defaultExp.split("").map((x, i) => {
            x === "(" ? openParenthesesIndexs.unshift(i) : "";
        });

        let parenthesesExp: string[] = [];
        openParenthesesIndexs.map((index) => {
            let actualExp: string = "";
            let openParentheses: number = 0;
            for (let i = index + 1; ; i++) {
                this.defaultExp[i] === "(" ? openParentheses++ : '';
                this.defaultExp[i] === ")" ? openParentheses-- : '';
                if (openParentheses < 0) {
                    parenthesesExp.push(actualExp);
                    break;
                }
                actualExp += this.defaultExp[i];
            }
        });

        return parenthesesExp;
    }

    private getOpsFromParenthesesExp(): string[] {
        let allOps: string[] = [];
        this.parenthesesExp.map((exp) => {
            let expOps: string[] = new Expression(exp).operations;
            expOps.map((exp) => { !allOps.includes(exp) ? allOps.push(exp) : "" });
        });
        return allOps;
    }

    private getOps(exp: string, operator: string): string[] {
        let operations: string[] = [];
        let opToGetPrevious: string[] = [];
        let actualOp: string = "";
        let openParentheses: number = 0;
        let toPush: boolean = false;
        let pushed: boolean = false;
                                              
        console.log("actual operator: " + operator);

        for (let i = 0; i < exp.length; i++) {
            actualOp += exp[i];
            console.log(actualOp);
            exp[i] === "(" ? openParentheses++ : '';
            exp[i] === ")" ? openParentheses-- : '';

            if (exp[i] === "¬" || openParentheses > 0) {
                continue;
            }

            // For expressions that begins with a operator
            if (actualOp[0].match(/[∨∧]/g) && actualOp[1]) {
                toPush = true;
            }

            // For simple expressions including the negation operator -> Av¬B
            // 1 - There is a element operator 2 characters before
            // 2 - Previous character is a negation operator
            // 3 - actualOp character is a uppercase letter
            if (exp[i - 2]?.match(/[∨∧]/g) && exp[i - 1] === "¬" && exp[i]?.match(/[A-Z]/g)) {
                toPush = true;
            }

            if (this.splitOp(actualOp).length === 3) {
                toPush = true;
            }

            if (toPush === true) {
                let [firstVar, actualOperator, secondVar] = this.splitOp(actualOp);
                if (actualOperator === operator) {
                    if (firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")" && !this.parenthesesExp.includes(firstVar.slice(1, -1))) {
                        firstVar = firstVar.slice(1, -1);
                    }
                    if (secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")" && !this.parenthesesExp.includes(secondVar.slice(1, -1))) {
                        secondVar = secondVar.slice(1, -1);
                    }
                    operations.push(this.invertExpression(actualOp));
                    actualOp = secondVar + actualOperator + firstVar;
                    opToGetPrevious.push(actualOp);
                    pushed = true;
                }
                // If operation hasn't the wanted operator,
                // actualOp becomes the second operand
                else {
                    actualOp = this.splitOp(actualOp)[2];
                    pushed = false;
                }
                // If actual operation WAS pushed,
                // then actualOp becomes the last operation.
                if (pushed) {
                    actualOp = "(" + opToGetPrevious[opToGetPrevious.length - 1] + ")"; // Last variable
                }
                toPush = false;
            }
        }
        return operations;
    }


    /**
     * Receive defaultExp and andOps.
     * Return the inverted expression
     * with the ANDs operations
     * surrounded by parentheses.
     */
    private surroundAndOps(): string {
        let newExp: string[] = this.defaultExp.split("");
        if (newExp[0] === "(" && newExp[newExp.length - 1] === ")") {
            return this.defaultExp;
        }
        let orderedAndOps: string[] = this.andOps.reverse();
        let charsToSkip: number = 0;
        for (let i = 0; i < orderedAndOps.length; i++) {
            const beginIndex: number = this.defaultExp.indexOf(orderedAndOps[i]) + charsToSkip;
            const endIndex: number = orderedAndOps[i].length + beginIndex + 1;
            newExp.splice(beginIndex, 0, "(");
            newExp.splice(endIndex, 0, ")");
            charsToSkip += 2;
        }
        return this.invertExpression(newExp.join(""));
    }

    public getConditionalOps(): string[] {
        let newExp: string[] = this.defaultExp.split("");
        let conditionals: string[] = [];
        let condIndexs: number[] = [];

        let expsToUse: string[] = [];

        // Get ≡ indexs if they are in exp
        if (this.defaultExp.includes("≡")) {
            this.defaultExp.split("≡").map((exp) => {
                let openParentheses: number = 0;
                exp.split("").map((char) => {
                    char === "(" ? openParentheses++ : "";
                    char === ")" ? openParentheses-- : "";
                });
                if (openParentheses === 0) {
                    expsToUse.push(exp);
                }
            });
        }

        // If there are exps taken from ≡ indexs
        if (expsToUse.length > 0) {
            expsToUse.map((exp) => {
                let condOps: string[] = new Expression(exp).conditionalOps;
                condOps.map((op) => {
                    conditionals.push(op);
                });
            });
            return conditionals;
        }

        // Get conditional indexs
        let openParentheses: number = 0;
        for (let i = 0; i < newExp.length; i++) {
            newExp[i] === "(" ? openParentheses++ : "";
            newExp[i] === ")" ? openParentheses-- : "";
            if (newExp[i] === "⇒" && openParentheses === 0) {
                condIndexs.push(i);
            }
        }

        // Get conditional ops from ⇒ indexs
        // At each unshift, the newExp remove the left op.
        let cuttedOpLength: number = 0;
        for (let i = 0; i < condIndexs.length; i++) {
            let actualCondIndex: number = condIndexs[i] - cuttedOpLength;
            let leftOp: string = newExp.slice(0, actualCondIndex).join("");
            let rightOp: string = newExp.slice(actualCondIndex + 1).join("");
            leftOp[0] === "(" && leftOp[leftOp.length - 1] === ")" ? leftOp = leftOp.slice(1, -1) : "";
            rightOp[0] === "(" && rightOp[rightOp.length - 1] === ")" ? rightOp = rightOp.slice(1, -1) : "";
            cuttedOpLength += leftOp.length + 1;
            let actual: string = `(${leftOp})⇒(${rightOp})`;
            conditionals.unshift(actual);
            newExp = newExp.slice(actualCondIndex + 1);
        }
        return conditionals;
    }

    private getEquivalenceOps(): string[] {
        let newExp: string[] = this.defaultExp.split("");
        let equivalenceOps: string[] = [];
        let operatorIndexs: number[] = [];

        let openParentheses: number = 0;
        newExp.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === "≡" && openParentheses === 0 ? operatorIndexs.push(i) : "";
        });

        let cuttedOpLength: number = 0;
        for (let i = 0; i < operatorIndexs.length; i++) {
            let actualEqOp: number = operatorIndexs[i] - cuttedOpLength;
            let leftOp: string = newExp.slice(0, actualEqOp).join("");
            let rightOp: string = newExp.slice(actualEqOp + 1).join("");
            leftOp[0] === "(" && leftOp[leftOp.length - 1] === ")" ? leftOp = leftOp.slice(1, -1) : "";
            rightOp[0] === "(" && rightOp[rightOp.length - 1] === ")" ? rightOp = rightOp.slice(1, -1) : "";
            cuttedOpLength += leftOp.length + 1;
            let actual: string = `(${leftOp})≡(${rightOp})`;
            equivalenceOps.unshift(actual);
            newExp = rightOp.split("");
        }
        return equivalenceOps;
    }

    private generateTruthTable(): [string, boolean[]][] {
        let truthTable: [string, boolean[]][] = [];
        let onlyLetters: number = 0;
        this.letters.map((letter) => {
            letter[0] !== "¬" ? onlyLetters++ : "";
        });
        const cases: number = 2 ** onlyLetters;

        // To letters
        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];
            let actual: [string, boolean[]] = [letter, []];

            if (letter[0] === "¬") {
                let letterValues: boolean[] = [];
                truthTable.map((array) => {
                    if (array[0] === letter[1]) {
                        letterValues = array[1];
                    }
                });

                letterValues.map((boolValue) => {
                    if (boolValue === true) {
                        actual[1].push(false);
                    } else {
                        actual[1].push(true);
                    }
                });
                truthTable.push(actual)
                continue;
            }

            if (i === 0) {
                for (let i = 0; i < cases; i++) {
                    if (i % 2 === 0) {
                        actual[1].push(true);
                    } else {
                        actual[1].push(false);
                    }
                }
            } else {
                const maxTrack: number = (2 ** (i + 1)) / 2;
                let actualTrack: number = 0;
                let actualBool: boolean = true;
                for (let i = 0; i < cases; i++) {
                    if (actualTrack == maxTrack) {
                        actualTrack = 0;
                        actualBool = actualBool ? false : true;
                    }
                    actualTrack++;
                    actual[1].push(actualBool);
                }
            }
            truthTable.push(actual);
        };

        // To each operation
        for (let i = 0; i < this.operations.length; i++) {
            let [firstVar, operator, secondVar] = this.splitOp(this.operations[i]);
            firstVar = firstVar.replaceAll("(", "").replaceAll(")", "");
            secondVar = secondVar.replaceAll("(", "").replaceAll(")", "");
            console.log(firstVar, secondVar);
            let actual: [string, boolean[]] = [firstVar + operator + secondVar, []];

            // Get values
            let firstVarValues: boolean[] = [];
            let secondVarValues: boolean[] = [];
            truthTable.map((array) => {
                if (array[0] === firstVar) {
                    firstVarValues = array[1];
                }
                if (array[0] === secondVar) {
                    secondVarValues = array[1];
                }
            });

            // Generate boolean values
            if (operator === "∨") {
                for (let x = 0; x < cases; x++) {
                    actual[1].push(firstVarValues[x] || secondVarValues[x]);
                }
            }
            if (operator === "∧") {
                for (let x = 0; x < cases; x++) {
                    let booleanValue: boolean = firstVarValues[x] && secondVarValues[x];
                    actual[1].push(booleanValue);
                }
            }
            if (operator === "⇒") {
                for (let x = 0; x < cases; x++) {
                    if (firstVarValues[x] === true && secondVarValues[x] === false) {
                        actual[1].push(false);
                    } else {
                        actual[1].push(true);
                    }
                }
            }
            if (operator === "≡") {
                for (let x = 0; x < cases; x++) {
                    if ((firstVarValues[x] === true && secondVarValues[x] === true) || (firstVarValues[x] === false && secondVarValues[x] === false)) {
                        actual[1].push(true);
                    } else {
                        actual[1].push(false);
                    }
                }
            }
            truthTable.push(actual);
        }

        let index: number = 0;
        truthTable.map((operationArray) => {
            if (operationArray[0].length > 2) {
                operationArray[0] = this.operations[index];
                index++;
            }
        });

        return truthTable;
    }
}

const expressionInput = document.getElementById("expression") as HTMLInputElement;
const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    run();
};

function run(): void {
    const expression: Expression = new Expression(expressionInput.value);
    console.log(expression);

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
        for (let operationArray of expression.truthTable) {
            const labelHeader: HTMLTableCellElement = document.createElement("th");
            labelHeader.textContent = operationArray[0]; // Variable
            headerRow.appendChild(labelHeader);
        }
        tableHeaderElement.appendChild(headerRow);
        table.appendChild(tableHeaderElement);

        const tableBodyElement: HTMLTableSectionElement = document.createElement("tbody");
        // Table's boolean values from expressions
        const cases: number = 2 ** expression.cases;
        // Create a row for body for each case
        for (let i = 0; i < cases; i++) {
            const bodyRow: HTMLTableRowElement = document.createElement("tr");
            // For each variable in truth table
            for (let x of expression.truthTable) {
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
        const lastColumnBooleanValues: boolean[] = expression.truthTable[expression.truthTable.length - 1][1];
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

const lightIcon: HTMLElement = document.createElement('i');
lightIcon.className = 'fa-solid fa-xl fa-moon d-flex light-mode';

const darkIcon: HTMLElement = document.createElement('i');
darkIcon.className = 'fa-solid fa-xl fa-sun d-flex dark-mode';

const lightIconTheme: string = "background:#F2994A;background:-webkit-linear-gradient(to right, #F2C94C, #F2994A);background:linear-gradient(to right, #F2C94C, #F2994A);";

const darkIconTheme: string = "background:#141E30;background:-webkit-linear-gradient(to right, #243B55, #141E30);background:linear-gradient(to right, #243B55, #141E30);";


let actualMode: string = "light";

const darkModeButton = document.getElementById("darkModeButton") as HTMLButtonElement;
darkModeButton.addEventListener('click', () => {
    let child: HTMLElement = darkModeButton.querySelector(':first-child');
    console.log(child.classList.value);
    if (child.classList.value.includes("light-mode")) {
        darkModeButton.removeChild(child);
        darkModeButton.appendChild(darkIcon)
        document.body.setAttribute("style", darkIconTheme);
        actualMode = "dark";
    } else {
        darkModeButton.removeChild(child);
        darkModeButton.appendChild(lightIcon);
        document.body.setAttribute("style", lightIconTheme);
        actualMode = "light";
    }
    console.log(actualMode);
});
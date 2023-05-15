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
    public operations: string[];
    public allOps: string[];

    constructor(defaultExp: string) {
        this.defaultExp = defaultExp.replaceAll("!", "¬");
        this.invertedExp = this.invertExpression(this.defaultExp);
        this.letters = this.getLetters();
        this.parenthesesExp = this.getParenthesesExp();
        this.parenthesesExpOps = this.getOpsFromParenthesesExp();
        this.andOps = this.getOps(this.invertedExp, "^");
        this.newInvertedExp = this.surroundAndOps();
        this.orOps = this.getOps(this.newInvertedExp, "v");
        this.conditionalOps = this.getConditionalOps();
        this.operations = [...this.andOps, ...this.orOps, ...this.conditionalOps]; // 
        this.allOps = [...this.letters, ...this.parenthesesExpOps, ...this.operations,];
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
            // Detects if next char is "-" indicating "->"
            if (["¬", "-"].includes(defaultExp[i])) {
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
            if (["¬", "<", "-"].includes(operation[i]) || openParentheses > 0) {
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
        let actual: string = "";
        for (let i = 0; i < this.defaultExp.length; i++) {
            if (actual.length > 0) {
                if (actual[0].match(/[A-Za-z]/g)) {
                    letters.push(actual);
                    actual = "";
                }
                else if (actual.length === 2 && actual[0] === "¬" && actual[1].match(/[A-Za-z]/g)) {
                    if (!letters.includes(actual.slice(1))) {
                        letters.push(actual.slice(1));
                    }
                    if (!notLetters.includes(actual.slice(1))) {
                        notLetters.push(actual.slice(1));
                    }
                    actual = "";
                }
            }

            if ((this.defaultExp[i] === "¬" && this.defaultExp[i + 1].match(/[A-Za-z]/g)) || this.defaultExp[i].match(/[A-Za-z]/g)) {
                actual += this.defaultExp[i];
            }
        }
        letters = letters.sort();
        notLetters = notLetters.sort().map((x) => { return "¬" + x }) // Adds "¬" to each letter
        console.log([...letters, ...notLetters]);
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
            expOps.map((exp) => {!allOps.includes(exp) ? allOps.push(exp) : ""});
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

        for (let i = 0; i < exp.length; i++) {

            actualOp += exp[i];
            exp[i] === "(" ? openParentheses++ : '';
            exp[i] === ")" ? openParentheses-- : '';

            if (exp[i] === "¬" || openParentheses > 0) {
                continue;
            }

            // For expressions that begins with a operator
            if (actualOp[0].match(/[v^]/g) && actualOp[1]) {
                toPush = true;
            }

            // For simple expressions including the negation operator -> Av¬B
            // 1 - There is a element operator 2 characters before
            // 2 - Previous character is a negation operator
            // 3 - actualOp character is a uppercase letter
            if (exp[i - 2]?.match(/[v^]/g) && exp[i - 1] === "¬" && exp[i]?.match(/[A-Z]/g)) {
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
        let orderedAndOps: string[] = this.andOps.reverse();
        let charsToSkip: number = 0;
        for (let i = 0; i < orderedAndOps.length; i++) {
            const beginIndex: number = this.defaultExp.indexOf(orderedAndOps[i]) + charsToSkip;
            const endIndex: number = orderedAndOps[i].length + beginIndex + 1;
            newExp.splice(beginIndex, 0, "(");
            newExp.splice(endIndex, 0, ")");
            charsToSkip += 2;
        }
        if (newExp[0] === "(" && newExp[newExp.length - 1] === ")") {
            return this.defaultExp;
        }
        return this.invertExpression(newExp.join(""));
    }

    private getConditionalOps(): string[] {
        let newExp: string[] = this.defaultExp.split("");
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
        console.log("from " + this.defaultExp);
        return conditionals;
    }
}

let exp = new Expression("A^B->C->!Z^(!A->!B)");
console.log(exp);
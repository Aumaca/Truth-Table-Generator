class Expression {
    constructor(defaultExp) {
        this.defaultExp = defaultExp.replaceAll("!", "¬");
        this.invertedExp = this.invertExpression(this.defaultExp);
        this.letters = this.getLetters();
        this.parenthesesExp = this.getParenthesesExp();
        this.parenthesesExpOps = this.getOpsFromParenthesesExp();
        this.andOps = this.getOps(this.invertedExp, "^");
        this.newInvertedExp = this.surroundAndOps();
        this.orOps = this.getOps(this.newInvertedExp, "v");
        this.conditionalOps = this.getConditionalOps();
        this.operations = [...this.letters, ...this.parenthesesExpOps, ...this.andOps, ...this.orOps, ...this.conditionalOps];
    }
    invertExpression(defaultExp) {
        let actualExp = "";
        let invertedExp = [];
        let openParentheses = 0;
        for (let i = 0; i < defaultExp.length; i++) {
            actualExp += defaultExp[i];
            if (defaultExp[i] === "(") {
                openParentheses++;
                continue;
            }
            if (defaultExp[i] === ")") {
                openParentheses--;
            }
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
    splitOp(operation) {
        let operationArray = [];
        let actualOp = "";
        let openParentheses = 0;
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
    getLetters() {
        let letters = [];
        let notLetters = [];
        let actual = "";
        for (let i = 0; i < this.defaultExp.length; i++) {
            if (actual.length > 0) {
                if (actual[0].match(/[A-Za-z]/g)) {
                    letters.push(actual);
                    actual = "";
                }
                if (actual.length === 2 && actual[0] === "¬" && actual[1].match(/[A-Za-z]/g)) {
                    notLetters.push(actual.slice(1));
                    actual = "";
                }
            }
            if ((this.defaultExp[i] === "¬" && this.defaultExp[i + 1].match(/[A-Za-z]/g)) || this.defaultExp[i].match(/[A-Za-z]/g)) {
                actual += this.defaultExp[i];
            }
        }
        letters = letters.sort();
        notLetters = notLetters.sort().map((x) => { return "¬" + x; });
        console.log([...letters, ...notLetters]);
        return [...letters, ...notLetters];
    }
    getParenthesesExp() {
        let openParenthesesIndexs = [];
        this.defaultExp.split("").map((x, i) => {
            x === "(" ? openParenthesesIndexs.unshift(i) : "";
        });
        let parenthesesExp = [];
        openParenthesesIndexs.map((index) => {
            let actualExp = "";
            let openParentheses = 0;
            for (let i = index + 1;; i++) {
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
    getOpsFromParenthesesExp() {
        let allOps = [];
        let andOps = [];
        let orOps = [];
        let conditionalOps = [];
        this.parenthesesExp.map((exp) => {
            let expOps = new Expression(exp).operations;
            expOps.map((exp) => { !allOps.includes(exp) ? allOps.push(exp) : ""; });
        });
        return allOps;
    }
    getOps(exp, operator) {
        var _a, _b;
        let operations = [];
        let opToGetPrevious = [];
        let actualOp = "";
        let openParentheses = 0;
        let toPush = false;
        let pushed = false;
        for (let i = 0; i < exp.length; i++) {
            actualOp += exp[i];
            exp[i] === "(" ? openParentheses++ : '';
            exp[i] === ")" ? openParentheses-- : '';
            if (exp[i] === "¬" || openParentheses > 0) {
                continue;
            }
            if (actualOp[0].match(/[v^]/g) && actualOp[1]) {
                toPush = true;
            }
            if (((_a = exp[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[v^]/g)) && exp[i - 1] === "¬" && ((_b = exp[i]) === null || _b === void 0 ? void 0 : _b.match(/[A-Z]/g))) {
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
                else {
                    actualOp = this.splitOp(actualOp)[2];
                    pushed = false;
                }
                if (pushed) {
                    actualOp = "(" + opToGetPrevious[opToGetPrevious.length - 1] + ")";
                }
                toPush = false;
            }
        }
        return operations;
    }
    surroundAndOps() {
        let newExp = this.defaultExp.split("");
        let orderedAndOps = this.andOps.reverse();
        let charsToSkip = 0;
        for (let i = 0; i < orderedAndOps.length; i++) {
            const beginIndex = this.defaultExp.indexOf(orderedAndOps[i]) + charsToSkip;
            const endIndex = orderedAndOps[i].length + beginIndex + 1;
            newExp.splice(beginIndex, 0, "(");
            newExp.splice(endIndex, 0, ")");
            charsToSkip += 2;
        }
        if (newExp[0] === "(" && newExp[newExp.length - 1] === ")") {
            return this.defaultExp;
        }
        return this.invertExpression(newExp.join(""));
    }
    getConditionalOps() {
        let newExp = this.defaultExp.split("");
        let conditionals = [];
        let condIndexs = [];
        let openParentheses = 0;
        newExp.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === ">" && openParentheses === 0 ? condIndexs.push(i) : "";
        });
        let cuttedOpLength = 0;
        for (let i = 0; i < condIndexs.length; i++) {
            let actualCondIndex = condIndexs[i] - cuttedOpLength;
            const leftOp = newExp.slice(0, actualCondIndex - 1).join("");
            const rightOp = newExp.slice(actualCondIndex + 1).join("");
            cuttedOpLength += leftOp.length + 2;
            let actual = `(${leftOp})->(${rightOp})`;
            conditionals.unshift(actual);
            newExp = newExp.slice(actualCondIndex + 1);
        }
        console.log("conditionals: ");
        console.log(conditionals);
        return conditionals;
    }
}
let exp = new Expression("A^B->C->!Z^(!A->!B)");
console.log(exp);
//# sourceMappingURL=test.js.map
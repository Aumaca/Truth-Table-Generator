const form = document.querySelector("form") as HTMLFormElement;
const expressionInput = document.getElementById("expression") as HTMLInputElement;

const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    run();
};

function run(): void {
    const expression: string = expressionInput.value;
    if (!checkExpression(expression)) {
        return window.alert("erro");
    }
    const letters: string[] = takeLetters(expression);
    const notLetters: string[] = takeNotLetters(expression);
    const parenthesisExp: string[] = takeParenthesisExpressions(expression);
    console.log(letters);
    console.log(notLetters);
    console.log(parenthesisExp);
    console.log(createRows(letters));
}


/**
 * Returns false if expression has invalid character or invalid '()'.
 */
function checkExpression(expression: string): boolean {
    const openParenthesis = Array.from(expression).filter(value => value == '(').length;
    const closeParenthesis = Array.from(expression).filter(value => value == '(').length;
    if (openParenthesis !== closeParenthesis) {
        return false;
    }
    if (!expression.match(/^[A-Zv^!()=><]|xor|->|=>$/g)) {
        return false;
    }
    return true;
}

/**
 * Returns array with unique alphabets characters in found order.
 */
function takeLetters(expression: string): string[] {
    let letters: string[] = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i].match(/[A-Z]/)) {
            if (!letters.includes(expression[i]) && expression[i] !== 'v') {
                letters.push(expression[i]);
            }
        }
    }
    return letters;
};

/**
 * Returns array with unique alphabets characters with "!" in found order.
 */
function takeNotLetters(expression: string) {
    let notLetters: string[] = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === "!" && expression[i + 1].match(/[A-Z]/)) {
            let actual: string = '';
            actual += expression[i];
            actual += expression[i + 1];
            if (!notLetters.includes(actual)) {
                notLetters.push(actual);
            }
        }
    }
    return notLetters;
};

function takeIndexs(expression: string, char: string): number[] {
    let indexs: number[] = [];
    for (let i = 0; i < expression.length; i++) {
        expression[i] === '(' ? indexs.push(i) : '';
    }
    return indexs;
}

function takeParenthesisExpressions(expression: string) {
    const openParenthesisIndexs: number[] = takeIndexs(expression, '(').reverse();
    let parenthesisExpressions: string[] = [];
    let actualParenthesis: string = '';
    let actualNotParenthesis: string = '';

    for (let x of openParenthesisIndexs) {
        for (let i = x; ; i++) {
            if (expression[i - 1] === '!' && expression[i] === '(') {
                actualNotParenthesis += "!";
            }
            if (actualNotParenthesis.length > 0) {
                actualNotParenthesis += expression[i];
            }
            actualParenthesis += expression[i];
            if (expression[i] === ')') {
                parenthesisExpressions.push(actualParenthesis);
                actualParenthesis = "";
                if (actualNotParenthesis.length > 0) {
                    parenthesisExpressions.push(actualNotParenthesis);
                    actualNotParenthesis = "";
                }
                break;
            }
        }
    }
    return parenthesisExpressions;
}


function changeActualBool(actualBool: boolean): boolean {
    if (actualBool === true) {
        return false;
    }
    return true;
}


function createRows(letters: string[]) {
    const cases: number = 2 ** letters.length;
    let allCases: [string, any[]][] = [];
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
            allCases.push(actual);
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
            allCases.push(actual);
        }
    }
    console.log(allCases);
}
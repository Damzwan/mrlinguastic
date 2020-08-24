import M from "materialize-css";

/**
 * Show a red error message
 * @param text the text of the message
 */
export function wrongMessage(text: string) {
    new M.Toast({html: text, classes: 'red darken-4 centered-img center', displayLength: 2000})
}

/**
 * Show a green error message
 * @param text the text of the message
 */
export function correctMessage(text: string) {
    new M.Toast({html: text, classes: 'green darken-4 centered-img center', displayLength: 2000})
}

/**
 * Show a normal error message
 * @param text the text of the message
 */
export function normalMessage(text: string) {
    new M.Toast({html: text, classes: 'centered-img center', displayLength: 2000})
}
import M from "materialize-css";

/**
 * Show a red error message
 * @param text the text of the message
 */
export function wrongMessage(text: string){
    new M.Toast({html: text, classes: 'rounded red darken-4 centered-img center', displayLength: 2000})
}
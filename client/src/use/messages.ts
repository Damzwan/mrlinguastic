export function wrongMessage(text: string){
    new M.Toast({html: text, classes: 'rounded red darken-4 centered-img center', displayLength: 2000})
}
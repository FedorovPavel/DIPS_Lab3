module.exports= {
    checkPaySystem : function(string){
        const admissibleSystems = ['Сбербанк','Открытие','Возрождение','Тинькофф','RocketBank', 'Raiffeisen',
                                    'Альфа-банк'];
        if (string){
            let res = String(string);
            if (admissibleSystems.indexOf(res) != -1)
                return res;
            else 
                return null;
        } else {
            return undefined;
        }
    },
    checkAccount : function(string){
        if (string){
            const input = String(string);
            const accountParts = input.split(' ');
            if (accountParts.length < 4 || accountParts.length >= 6)
                return null;
            else {
                for (let I = 0; I < accountParts.length; I++){
                    const temp = parseInt(accountParts[I]);
                    if (isNaN(temp)){
                        return null;
                    }
                }
                return input;
            }
        } else {
            return undefined;
        }
    },
    checkCost : function(string){
        if (string){
            let number = parseFloat(string);
            if (isNaN(number) || number < 10.0)
                return null;
            else 
                return Number(number);
        } else {
            return undefined;
        }
    }
}
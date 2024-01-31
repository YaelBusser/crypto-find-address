const generateMnemonic = () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.mnemonic.phrase;
};

const getAddress = (mnemonic) => {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return wallet.address;
};
let nbAccounts = 0;
let nbWithoutTransactions = 0;
let nbWithTransactions = 0;
let account;
let isScanning = false;

const itemsPerPage = 10;
let currentPage = 1;
const toggleScan = () => {
    const blockButton = document.getElementById('content-scanner');
    const loader = document.createElement('img');
    loader.id = "img-loader";
    const loaderElement = document.getElementById('img-loader');
    const button = document.getElementById('button');
    if (button) {
        isScanning = !isScanning;
        button.textContent = isScanning ? 'stop' : 'start';
    }

    if (isScanning) {
        checkTransactions();
        loader.src = 'assets/images/loader.gif';
        blockButton.appendChild(loader);
    } else {
        blockButton.removeChild(loaderElement);
    }
}
const updateAccountsFound = (nbAccounts) => {
    const accountsFoundSpan = document.getElementById('accountsFound');
    if (accountsFoundSpan) {
        accountsFoundSpan.textContent = nbAccounts.toString();
    }
};
const updateWithoutTransactions = (nbWithoutTransactions) => {
    const withoutTransactions = document.getElementById('without-transactions');
    if (withoutTransactions) {
        withoutTransactions.textContent = nbWithoutTransactions.toString();
    }
}
const updateWithTransactions = (nbWithTransactions) => {
    const withTransactions = document.getElementById('with-transactions');
    if (withTransactions) {
        withTransactions.textContent = nbWithTransactions.toString();
    }
}
const updateListAccounts = (account) => {
    const listAccountsContent = document.getElementById('list-accounts-content');
    if (listAccountsContent) {

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const accountsToDisplay = listAccountsContent.slice(startIndex, endIndex);

        const accountElement = document.createElement('div');
        accountElement.classList.add('data');

        const phraseElement = document.createElement('p');
        phraseElement.textContent = account.phrase;
        accountElement.appendChild(phraseElement);

        const addressElement = document.createElement('p');
        addressElement.textContent = account.address;
        accountElement.appendChild(addressElement);

        const transactionElement = document.createElement('p');
        transactionElement.textContent = account.transaction;
        accountElement.appendChild(transactionElement);

        listAccountsContent.insertBefore(accountElement, listAccountsContent.firstChild);
    }
};
const checkTransactions = async () => {
    if (!isScanning) {
        return;
    }
    const mnemonic = generateMnemonic();
    console.log(mnemonic);
    try {
        const apiKey = "RZ7SYFIQRNJAGUKZ1QJ9KES5R9AUPZU8HW";
        const targetUrl = `https://api.etherscan.io/api`;
        const etherscanAPIUrl = `${targetUrl}?module=account&action=txlist&address=${getAddress(mnemonic)}&tag=latest&apikey=${apiKey}`;
        try {
            const response = await fetch(etherscanAPIUrl);
            const data = await response.json();
            const transactions = data.result;
            nbAccounts++;
            updateAccountsFound(nbAccounts);
            const hasValueTransactions = transactions.some(transaction => parseFloat(transaction.value) > 0);
            if (hasValueTransactions) {
                console.log("oui");
                console.log(transactions);
                nbWithTransactions++;
                updateWithTransactions(nbWithTransactions);
                account = {
                    phrase: mnemonic,
                    address: getAddress(mnemonic),
                    transaction: "Transaction founded"
                }
                let walletFound = transactions;
                updateListAccounts(account);
                console.log("walletFound", walletFound);
            } else {
                console.log("non");
                await new Promise(resolve => setTimeout(resolve, 200));
                nbWithoutTransactions++;
                updateWithoutTransactions(nbWithoutTransactions);
                account = {
                    phrase: mnemonic,
                    address: getAddress(mnemonic),
                    transaction: ""
                }
                updateListAccounts(account);
                checkTransactions();
            }
        } catch (error) {
            console.error("Erreur lors de la vérification des transactions :", error);
        }

    } catch (error) {
        console.error("Erreur lors de la requête HTTP :", error.message);
    }
};


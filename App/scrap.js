//( async () => {
    const btnSearch = document.querySelector('#btnSearch');

    btnSearch.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const port = chrome.tabs.connect(tab.id);
        // Send scanning to app.js
        port.postMessage({action: 'scanning'});
        
        port.onMessage.addListener(function (response) {
            const { action } = response;
            // Receive endScan from app.js
            if(action == 'endScan') {
                console.log('Scan ended')
                //console.log('app.js endScan post goToURL')
                port.postMessage({action: 'goToURL'});
            }
        });
        
    });
//})();
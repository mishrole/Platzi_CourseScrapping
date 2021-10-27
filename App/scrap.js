const btnSearch = document.querySelector('#btnSearch');
const code = document.querySelector('.data');
const btnOpen = document.querySelector('#btnOpen');
    
const showPreviousData = async () => {

    await chrome.storage.local.get(['platziCourseData'], function(result) {
        if(Object.keys(result).length > 0) {
            code.innerHTML = JSON.stringify(result, undefined, 2);
        } else {
            code.innerText = '¡Oops! Parece que no tienes cursos';
        }
    });
    
}

showPreviousData();

const isCourseDuplicated = (savedCourses, newCourse) => {

    let coincidences = 0;

    savedCourses.filter(savedCourse => {
        if(savedCourse.courseTitle === newCourse.courseTitle) {
            coincidences++;
        }
    })

    if(coincidences > 0) {
        return true
    }

    return false
}

const setLocalData = async (newCourse) => {

    await chrome.storage.local.get(['platziCourseData'], (result) => {

        let dataResult;

        if(Object.keys(result).length > 0) {

            if(isCourseDuplicated(result['platziCourseData'], newCourse[0])) {
                dataResult = {'platziCourseData': [...result['platziCourseData']]}
            } else {
                chrome.storage.local.set({'platziCourseData': [newCourse[0], ...result['platziCourseData']]})
                dataResult = {'platziCourseData': [newCourse[0], ...result['platziCourseData']]}
            }
            
        } else {
            chrome.storage.local.set({'platziCourseData': [newCourse[0]]});
            dataResult = {'platziCourseData': [newCourse[0]]}
        }

        code.innerHTML = JSON.stringify(dataResult, undefined, 2);
        console.log(dataResult)

    });

}

const transformTime = (time) => {

    const timeExtract = `00:${time.slice(0, time.length - 4)}`;
    const target = new Date(`1970-01-01 ${timeExtract}`);
    return target
    //console.log(`Minutes: ${target.getMinutes()} | Seconds: ${target.getSeconds()}`)
}


( async () => {

    btnSearch.addEventListener('click', async () => {

        await chrome.tabs.query({ active: true, currentWindow: true }, (result) => {

            if(chrome.runtime.lastError) {
                console.log("ERROR EN EXTENSIÓN")
            } else {

                if(result[0].url.includes('platzi.com/clases/')) { // Important
                    const port = chrome.tabs.connect(result[0].id);
                    // chrome.tabs.sendMessage(result[0].id,"test1")
    
                    // -> Send to app.js
                    port.postMessage({action: 'start'});
                        
                    port.onMessage.addListener(function (response) {
                        const { action, data } = response;
        
                        // <- Receive from app.js
                        if(action == 'sendResult') {
                            setLocalData(data);
        
                            if(data) {
                                // -> Send to app.js
                                port.postMessage({action: 'goToURL'});
                            }
        
                        } else if(action === 'test2') {
                            console.log("test2 scrap.js - recibido")
                        }
                    });
                } else {
                    alert('Oops! No platzi course information')
                }
            }
        });
    });

    code.addEventListener('mouseover', () => {
        document.documentElement.style.setProperty('--scrollbar-thumb', '#637b9d');
    });

    code.addEventListener('mouseout', () => {
        document.documentElement.style.setProperty('--scrollbar-thumb', 'transparent');
    })

})();
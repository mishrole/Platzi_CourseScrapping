// .Timeline > .TimelineLeft > .TabsContent > .TabsContent-elements > .Material
// Content List: .Material > .Material-concept
// Title: .Material-concept > .Material-concept-edit > .Material-title
// Concept List: .Material-concept > .MaterialItem-content
// Concept Data: .MaterialItem-content > .MaterialItem > .MaterialItem-copy
// Concept Data Title: .MaterialItem-copy > .MaterialItem-copy-title
// Concept Data Time: .MaterialItem-copy > .MaterialItem-copy-time

const wait = function (miliseconds) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, miliseconds);
    });
}

const autoScroll = async (scrollTo) => {
    const element = document.querySelector(scrollTo);

    window.scrollTo({
        top: element.scrollHeight,
        left: 0,
        behavior: 'smooth'
    });

    //console.log(element.scrollHeight);
    
    /*while(element) {
        const maxScrollTop = document.body.clientHeight - window.innerHeight;
        const elementScrollTop = document.querySelector(scrollTo).offsetHeight;
        const currentScrollTop = window.scrollY;

        if(maxScrollTop == currentScrollTop || elementScrollTop <= currentScrollTop)
        break;

        await wait(32);

        const newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop);
        window.scrollTo(0, newScrollTop);
    }*/

    return new Promise(function(resolve) {
        resolve();
    });
}

const scrapingCourse = async () => {

    const tabsContent = document.querySelector('.TabsContent');
    const tabsContentElements = document.querySelector('.TabsContent-elements');

    const hasCourseTabsContent = () => {
        if(tabsContent && tabsContentElements) {
            return true
        }

        return false
    }

    const getMaterialData = async () => {
        const materialConceptData = document.querySelectorAll('.Material-concept');
        const courseTitle = document.querySelector('.CourseDetail-left-title').textContent;

        let courseData = [];

        materialConceptData.forEach(concept => {
            const conceptTitle =  concept.querySelector('.Material-title').innerHTML;
            const materialContentData = concept.querySelectorAll('.MaterialItem');

            const conceptData = {
                concept: conceptTitle,
                items: []
            }

            materialContentData.forEach(content => {
                const contentTitle = content.querySelector('.MaterialItem-copy-title').innerHTML;
                const contentTime = content.querySelector('.MaterialItem-copy-time').textContent;

                conceptData.items.push({title: contentTitle, time: contentTime});

            });
            
            courseData.push(conceptData);

        });
        
        return [{courseTitle, courseData}]
    }

    /*const setLocalData = async (courseInformation) => {
        let platziCourse;

        if(window.localStorage.getItem('platziCourseData') !== null) {
            platziCourse = await JSON.parse(window.localStorage.getItem('platziCourseData'));
        } else {
            platziCourse = [];
        }

        platziCourse = [ ...platziCourse, { courseInformation } ]
        window.localStorage.setItem('platziCourseData', JSON.stringify(platziCourse));
    }*/
    
    if(hasCourseTabsContent) {

        await autoScroll('.TimelineLeft');
        const courseInformation = await getMaterialData();
        console.log(courseInformation)
        return courseInformation

    }

    return false

}

(async function() {
    chrome.runtime.onConnect.addListener(async function(port) {
        port.onMessage.addListener(async function(message) {
            const { action } = message;
            // Receive from scrap.js
            if(action == 'start') {

                try {
                    const scanResult = await scrapingCourse();

                    if(scanResult) {
                        console.log('Scaneando temario');
                    } else {
                        console.log('No hay temario');
                    }
                    
                    // Send to scrap.js
                    port.postMessage({action: 'sendResult', data: scanResult});
                } catch (error) {
                    console.error(error);
                }

            } else if(action == 'goToURL') {
                console.log('scrap.js receive goToURL with data');
            }
        })
    });

    /*try {
        await scrapingCourse();
        alert('Funciona')
    } catch (error) {
        console.error(error)
    }*/
})();

/*
    // Get Content Time Test (First only)

    const time = document.querySelector('.MaterialItem-copy-time').textContent
    const timeExtract = `00:${time.slice(0, time.length - 4)}`
    const target = new Date(`1970-01-01 ${timeExtract}`)
    console.log(`Minutes: ${target.getMinutes()} | Seconds: ${target.getSeconds()}`)
    
*/
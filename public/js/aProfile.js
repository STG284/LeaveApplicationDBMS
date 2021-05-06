$(document).ready(function () {

    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.send = "always";

    $("#addPublicationBtn").hide();
    $("#deletePublicationBtn").hide()

    $("#newPublicationContainer").hide();
    $("#publicationRemoveConfirmContainer").hide()

    $("#addCourseBtn").hide();
    $("#deleteCourseBtn").hide()

    $("#newCourseContainer").hide();
    $("#courseRemoveConfirmContainer").hide()

    //Flag helps to understand whether the textarea under publication
    //needs to be shown or not
    //if flagPub is even then hide it else show it
    let flagCourse = 0;

    if (flagCourse == 0) {
        $("#coursesArea").hide();
    }


    function onError(response, newValue) {
        console.error(response, response.status)
        if (response.status === 500 || response.status === 0) {
            console.log("errorr: Service unavailable. Please try later.")
            return 'Service unavailable. Please try later.';
        } else {
            console.log("response: ", response.responseText)
            return response.responseText;
        }
    }


    async function postAllPublicationsToServer() {
        var allPublications = [];
        $("#publicationsList li").each(function () { allPublications.push($(this).text().trim()) });

        try {
            console.log("pushing: ", allPublications)
            await $.post(url = document.URL, { name: 'publications', value: allPublications })
        } catch (error) {
            return "ERROR!: " + error
        }
        return null;
    }

    async function postAllCoursesToServer() {
        var allCourses = [];
        $("#coursesList li").each(function () { allCourses.push($(this).text().trim()) });

        try {
            console.log("pushing: ", allCourses)
            await $.post(url = document.URL, { name: 'courses', value: allCourses })
        } catch (error) {
            return "ERROR!: " + error
        }
        return null;
    }

    // call this when user has rights to edit the profile
    function makeEverythingEditable() {

        $("#addPublicationBtn").show();
        $("#deletePublicationBtn").show()

        $("#addCourseBtn").show();
        $("#deleteCourseBtn").show()

        $("#email").editable({
            title: 'Enter email',
            url: document.URL,
            error: onError
        });

        $("#url").editable({
            title: 'Enter url',
            url: document.URL,
            error: onError
        });

        $("#office").editable({
            title: 'Enter office address',
            url: document.URL,
            error: onError
        });

        $("#researchInterests").editable({
            title: 'Enter research interests',
            url: document.URL,
            error: onError,
            tpl: '<textarea type="textarea" style="width: 280px;">'
        });

        $("#background").editable({
            title: 'Enter background',
            url: document.URL,
            anim: "true",
            error: onError,
            tpl: '<textarea type="textarea" style="width: 680px; resize: both;" rows="7">'
        });

        $("#newPublication").editable({
            title: 'New Publication:',
            anim: "true",
            emptytext: "Add new publication here",
            success: async function (response, newValue) {

                let newIndex = $("#publicationsList li").length;

                $("#publicationsList").append(`<li class="p-2"> ${newValue} </li>`)
                let res = await postAllPublicationsToServer()

                if (res != null) {
                    console.error(res)
                    return res
                }

                $("#newPublication").editable('setValue', '');

                $("#newPublicationContainer").hide()
                $("#addPublicationBtn").show()
            },
            error: onError,
            tpl: '<textarea type="textarea" style="width: 630px; resize: both;" rows="7">'
        });

        $("#newCourse").editable({
            title: 'New Course:',
            anim: "true",
            emptytext: "Add new course here",
            success: async function (response, newValue) {

                let newIndex = $("#coursesList li").length;

                $("#coursesList").append(`<li class="p-2"> ${newValue} </li>`)
                let res = await postAllCoursesToServer()

                if (res != null) {
                    console.error(res)
                    return res
                }

                $("#newCourse").editable('setValue', '');

                $("#newCourseContainer").hide()
                $("#addCourseBtn").show()
            },
            error: onError,
            tpl: '<textarea type="textarea" style="width: 630px; resize: both;" rows="7">'
        });


        // __________________ setting up Publication UI here __________________


        // display newpublicationEditable and hide the add new button
        $("#addPublicationBtn").click(function () {
            $("#newPublicationContainer").show()
            $("#addPublicationBtn").hide()
        })

        $("#deletePublicationBtn").click(() => {
            $("#publicationRemoveConfirmContainer").show()
            $("#deletePublicationBtn").hide()
        })

        $("#publicationRemoveConfirmButton").click(async () => {
            // to remove publication at given index from UI as well from backend

            let index = $("#publicationRemoveIndex").val()
            index--; // imp as list index is 0-based
            var allPublications = [];
            $("#publicationsList li").each(function () { allPublications.push($(this).text()) });

            if (index < 0 && index >= allPublications.length)
                return;

            allPublications.splice(index, 1)

            $("#publicationsList li").eq(index).remove()

            let res = await postAllPublicationsToServer()

            $("#publicationRemoveConfirmContainer").hide()
            $("#deletePublicationBtn").show()

            if (res != null) {
                console.error(res)
                return res
            }
        })


        // __________________ setting up Courses UI here __________________
        
        // display newCourseEditable and hide the add new button
        $("#addCourseBtn").click(function () {
            $("#newCourseContainer").show()
            $("#addCourseBtn").hide()
        })

        $("#deleteCourseBtn").click(() => {
            $("#courseRemoveConfirmContainer").show()
            $("#deleteCourseBtn").hide()
        })

        $("#courseRemoveConfirmButton").click(async () => {
            
            // to remove course at given index from UI as well from backend

            let index = $("#courseRemoveIndex").val()
            index--; // imp as list index is 0-based
            var allCourses = [];
            $("#coursesList li").each(function () { allCourses.push($(this).text()) });

            if (index < 0 && index >= allCourses.length)
                return;

            allCourses.splice(index, 1)

            $("#coursesList li").eq(index).remove()

            let res = await postAllCoursesToServer()

            $("#courseRemoveConfirmContainer").hide()
            $("#deleteCourseBtn").show()

            if (res != null) {
                console.error(res)
                return res
            }
        })
   
    }

    

    if (allowEdits != null && allowEdits) {
        makeEverythingEditable()
    }

})
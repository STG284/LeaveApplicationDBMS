$(document).ready(function () {

    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.send = "always";

    $("#addPublicationBtn").hide();
    $("#deletePublicationBtn").hide()


    $("#newPublicationContainer").hide();
    $("#publicationRemoveConfirmContainer").hide()

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

    // call this when user has rights to edit the profile
    function makeEverythingEditable() {

        $("#addPublicationBtn").show();
        $("#deletePublicationBtn").show()

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


        // __________________ setting up Publication UI here __________________


        // display newpublicationEditable and hide the add new button
        $("#addPublicationBtn").click(function () {
            $("#newPublicationContainer").show()
            $("#addPublicationBtn").hide()
        })

        //function which works on clicking the Add button in front of the publication
        $("#addCourseBtn").click(function () {
            console.log("Add Course button clicked");
            var x = "Add New Course";
            var y = "BYE";
            if (flagCourse % 2 == 0) {
                $("#coursesArea").show();
                flagCourse = 1;
                document.getElementById("coursesArea").innerHTML = x;
            }
            else {
                $("#coursesArea").hide();
                document.getElementById("coursesArea").innerHTML = y;
                flagCourse = 0;
            }
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
        
        // todo
    }

    

    if (allowEdits != null && allowEdits) {
        makeEverythingEditable()
    }

})
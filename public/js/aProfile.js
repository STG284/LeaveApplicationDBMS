$(document).ready(function () {

    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.send = "always";

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
    
    //Flag helps to understand whether the textarea under publication
    //needs to be shown or not
    //if flagPub is even then hide it else show it
    var flagPub=0;
    if(flagPub==0) {
        $("#publicationArea").hide();
    }

    //function which works on clicking the Add button in front of the publication
    $("#addPublicationBtn").click(function(){
        console.log("Add button clicked");
        var x = "Add New Publication";
        var y ="BYE";
        if(flagPub%2==0){
            $("#publicationArea").show();
            flagPub=1;
            document.getElementById("publicationArea").innerHTML = x;
        }
        else{
            $("#publicationArea").hide();
            // document.getElementById("publicationArea").innerHTML = y;
            flagPub=0;
        }     
    })


    var flagCourse=0;
    if(flagCourse==0) {
        $("#coursesArea").hide();
    }

    //function which works on clicking the Add button in front of the publication
    $("#addCourseBtn").click(function(){
        console.log("Add Course button clicked");
        var x = "Add New Course";
        var y ="BYE";
        if(flagCourse%2==0){
            $("#coursesArea").show();
            flagCourse=1;
            document.getElementById("coursesArea").innerHTML = x;
        }
        else{
            $("#coursesArea").hide();
            document.getElementById("coursesArea").innerHTML = y;
            flagCourse=0;
        }     
    })


    function makeEverythingEditable() {
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
            tpl:'<textarea type="textarea" style="width: 280px;">'
        });
    
        $("#background").editable({
            title: 'Enter background',
            url: document.URL,
            anim:"true",
            error: onError,
            tpl:'<textarea type="textarea" style="width: 680px; resize: both;" rows="7">'
        });

    }

    // function makePublicationEditable() {
    //     $("#publication").editable({
    //         title: 'Enter new publication',
    //         url: document.URL,
    //         anim:"true",
    //         error: onError,
    //         tpl:'<textarea type="textarea" style="width: 680px; resize: both;" rows="7">'
    //     });
    // }


    if(allowEdits!=null && allowEdits){
        makeEverythingEditable()
    }
    
})
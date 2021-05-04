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

    if(allowEdits!=null && allowEdits){
        makeEverythingEditable()
    }
    
})
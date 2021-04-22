$(document).ready(function () {

    $("#designation_Dropdown").change(function () {
        var el = $(this);
        $("#type_or_dept_Dropdown option").remove();

        let dean1 = '<option value="DeanFacultyAffairs" style="background-color: white; color: #1a75ff;">Faculty Affairs</option>'
        let dean2 = '<option value="DeanAcademics" style="background-color: white; color: #1a75ff;">Academic Affairs</option>'

        let hod1 = '<option value="CSE" style="background-color: white; color: #1a75ff;">CSE</option>'
        let hod2 = '<option value="EE" style="background-color: white; color: #1a75ff;">EE</option>'
        let hod3 = '<option value="ME" style="background-color: white; color: #1a75ff;">ME</option>'


        if (el.val() === "HOD") {
            
            $("#type_or_dept_Dropdown").append(hod1);
            $("#type_or_dept_Dropdown").append(hod2);
            $("#type_or_dept_Dropdown").append(hod3);
        } else {
            
            $("#type_or_dept_Dropdown").append(dean1);
            $("#type_or_dept_Dropdown").append(dean2);
        }
    });

});
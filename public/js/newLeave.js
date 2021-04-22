function daysDifference() {

    var calc = document.getElementById("num_days")
    var dateI1=document.getElementById("startDateNew").value;
    var dateI2=document.getElementById("endDateNew").value;

    var date1=new Date(dateI1);
    var date2=new Date(dateI2);
    var time_difference = date2.getTime() - date1.getTime();  
    
    //calculate days difference by dividing total milliseconds in a day  
    var days_difference = time_difference / (1000 * 60 * 60 * 24); 

    document.getElementById("num_days").innerHTML = days_difference;

    // document.write(days_difference);
}
const Departments = {
    CSE: 'CSE',
    EE: 'EE',
    ME: 'ME'
};
  
const DeanType = {
    DeanFacultyAffairs: 'DeanFacultyAffairs',
    DeanAcademics: 'DeanAcademics'
};
  
const LeaveStatus = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    terminated : 'terminated',
    systemTerminated : 'systemTerminated'
};
  
const LeaveApplicationType = {
    Normal: 'Normal',
    Special: 'Special',
    Retrospective: 'Retrospective'
};

// Note:
// node js format: 2021-04-15 18:52:31+05:30
// pgsql format: 2021-04-15 21:58:08.27727+05:30
const TIME_STAMP_PGSQL_FORMAT = "yyyy-mm-dd HH:MM:ssp"
const DATE_PGSQL_FORMAT = "yyyy-mm-dd"
const DATE_FRONTEND_FORMAT = "dd-mm-yyyy"

module.exports = {
    Departments: Departments,
    DeanType: DeanType,
    LeaveStatus: LeaveStatus,
    LeaveApplicationType: LeaveApplicationType,
    TIME_STAMP_PGSQL_FORMAT: TIME_STAMP_PGSQL_FORMAT,
    DATE_PGSQL_FORMAT: DATE_PGSQL_FORMAT,
    DATE_FRONTEND_FORMAT: DATE_FRONTEND_FORMAT
}
-- Commands to create relations

CREATE TYPE Departments AS ENUM (
  'CSE',
  'EE',
  'ME'
);

CREATE TYPE DeanType AS ENUM (
  'DeanFacultyAffairs',
  'DeanAcademics'
);

CREATE TYPE LeaveStatus AS ENUM (
  'pending',
  'approved',
  'rejected',
  'terminated',
  'systemTerminated'
);

CREATE TYPE LeaveApplicationType AS ENUM (
  'LPNormal',
  'LPSpecial',
  'LPRetrospective'
);

CREATE TABLE Employee (
  EID int PRIMARY KEY NOT NULL,
  name varchar NOT NULL,
  deptName Departments NOT NULL,
  leavesRemaining int NOT NULL,
  penaltyLeaves int NOT NULL
);

CREATE TABLE SpecialDesignation (
  EID int,
  designation varchar NOT NULL,
  type_or_dept varchar NOT NULL,
  startDate timestamp NOT NULL,
  endDate timestamp NOT NULL
);

CREATE TABLE LeaveProgressNormal (
  LID int NOT NULL,
  hodEID int NOT NULL,
  deanEID int NOT NULL,
  isHODApproved bool NOT NULL,
  isDeanApproved bool NOT NULL,
  PRIMARY KEY (LID, hodEID, deanEID)
);

CREATE TABLE LeaveProgressNormalRetrospective (
  LID int NOT NULL,
  hodEID int NOT NULL,
  deanEID int NOT NULL,
  directorEID int NOT NULL,
  isHODApproved bool NOT NULL,
  isDeanApproved bool NOT NULL,
  isDirectorApproved bool NOT NULL,
  PRIMARY KEY (LID, hodEID, deanEID, directorEID)
);

CREATE TABLE LeaveProgressSpecial (
  LID int NOT NULL,
  directorEID int NOT NULL,
  isDirectorApproved bool NOT NULL,
  PRIMARY KEY (LID, directorEID)
);

CREATE TABLE LeaveApplication (
  LID int PRIMARY KEY NOT NULL,
  EID int NOT NULL,
  dateOfApplication timestamp NOT NULL,
  type LeaveApplicationType NOT NULL,
  status LeaveStatus NOT NULL,
  leaveStartDate timestamp NOT NULL,
  leaveEndDate timestamp NOT NULL,
  content varchar NOT NULL
);

CREATE TABLE Events (
  LID int NOT NULL,
  byEID int NOT NULL,
  time timestamp NOT NULL,
  content varchar NOT NULL,
  newStatus LeaveStatus NOT NULL,
  PRIMARY KEY (LID, byEID, time)
);

ALTER TABLE SpecialDesignation ADD FOREIGN KEY (EID) REFERENCES Employee (EID);

ALTER TABLE LeaveProgressNormal ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormal ADD FOREIGN KEY (hodEID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormal ADD FOREIGN KEY (deanEID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormalRetrospective ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormalRetrospective ADD FOREIGN KEY (hodEID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormalRetrospective ADD FOREIGN KEY (deanEID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressNormalRetrospective ADD FOREIGN KEY (directorEID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressSpecial ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveProgressSpecial ADD FOREIGN KEY (directorEID) REFERENCES LeaveApplication (LID);

ALTER TABLE Events ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveApplication ADD FOREIGN KEY (EID) REFERENCES Employee (EID);

ALTER TABLE Events ADD FOREIGN KEY (byEID) REFERENCES Employee (EID);


COMMENT ON COLUMN SpecialDesignation.designation IS 'can be HOD or Dean';

COMMENT ON COLUMN SpecialDesignation.type_or_dept IS 'can be one of DeanType or one of Departments';

COMMENT ON COLUMN LeaveApplication.content IS 'this is the text written by the employee';

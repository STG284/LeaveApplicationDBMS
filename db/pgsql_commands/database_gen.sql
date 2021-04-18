-- commands to delete all tables
DROP SCHEMA public CASCADE;

CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;


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
  'Normal',
  'Special',
  'Retrospective'
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
  startDate date NOT NULL,
  endDate date NOT NULL
);

CREATE TABLE LeaveRoute (
  LID int NOT NULL,
  position int NOT NULL,
  designation varchar NOT NULL,
  type_or_dept varchar NOT NULL,
  isApproved bool DEFAULT FALSE NOT NULL,
  PRIMARY KEY (LID, position)
);

CREATE TABLE LeaveApplication (
  LID serial PRIMARY KEY NOT NULL,
  EID int NOT NULL,
  dateOfApplication date NOT NULL DEFAULT (now()),
  type LeaveApplicationType NOT NULL,
  status LeaveStatus NOT NULL DEFAULT 'pending',
  leaveStartDate date NOT NULL,
  leaveEndDate date NOT NULL,
  content varchar NOT NULL
);

CREATE TABLE ApplicationEvent (
  LID int NOT NULL,
  byEID int NOT NULL,
  time timestamp NOT NULL DEFAULT (now()),
  content varchar NOT NULL,
  newStatus LeaveStatus NOT NULL,
  PRIMARY KEY (LID, byEID, time)
);

CREATE TABLE ApplicationRowLock (
  EID int PRIMARY KEY,
  isLALocked bool
);

ALTER TABLE SpecialDesignation ADD FOREIGN KEY (EID) REFERENCES Employee (EID);

ALTER TABLE LeaveRoute ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE LeaveRoute ADD FOREIGN KEY (checkerEID) REFERENCES Employee (EID);

ALTER TABLE ApplicationEvent ADD FOREIGN KEY (LID) REFERENCES LeaveApplication (LID);

ALTER TABLE ApplicationRowLock ADD FOREIGN KEY (EID) REFERENCES Employee (EID);

ALTER TABLE LeaveApplication ADD FOREIGN KEY (EID) REFERENCES Employee (EID);

ALTER TABLE ApplicationEvent ADD FOREIGN KEY (byEID) REFERENCES Employee (EID);


COMMENT ON COLUMN SpecialDesignation.designation IS 'can be HOD, Dean or Director';

COMMENT ON COLUMN SpecialDesignation.type_or_dept IS 'can be Director, or one of DeanType or one of Departments';

COMMENT ON COLUMN LeaveApplication.content IS 'this is the text written by the employee';

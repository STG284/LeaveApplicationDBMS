
-- system profile: to system reject!
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (-1, 'SYSTEM', 'CSE', 0, 0);

-- Employee table Populator:
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (1, 'Ram', 'CSE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (2, 'Sham', 'CSE', 9, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (3, 'Mr X', 'EE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (4, 'Mukul Kakar', 'ME', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (5, 'Vishal Bawa', 'ME', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (6, 'Vasudha Badal', 'CSE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (7, 'Pratik Dar', 'EE', 10, 1);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (8, 'Kashika Reddy', 'ME', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (9, 'Aarushi Pandey', 'CSE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (10, 'Zoya Mahajan', 'ME', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (11, 'Mehul Borra', 'CSE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (12, 'Ansh Mammen', 'EE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (13, 'Rati Iyer', 'EE', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (14, 'Anaya Dasgupta', 'ME', 10, 0);
INSERT INTO Employee(EID, name, deptName, leavesRemaining, penaltyLeaves) VALUES (15, 'Sushila Madan', 'EE', 10, 0);

-- SpecialDesignation table Populator:
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (3, 'Director', 'Director', '2021-04-13', '2025-04-13');
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (1, 'HOD', 'CSE', '2021-04-13', '2025-04-13');
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (9, 'Dean', 'DeanFacultyAffairs', '2021-04-13', '2025-04-13');
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (4, 'Dean', 'DeanAcademics', '2021-04-13', '2025-04-13');
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (5, 'HOD', 'ME', '2021-04-13', '2025-04-13');
INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (7, 'HOD', 'EE', '2021-04-15', '2025-04-15');
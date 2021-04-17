-- trigger to create entry in ApplicationLock when new employee is added:
CREATE OR REPLACE FUNCTION applicationLockCreator()
RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO ApplicationRowLock(EID, isLALocked) VALUES(NEW.eid, FALSE);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applicationLockCreatorTrigger
AFTER INSERT ON Employee
FOR EACH ROW EXECUTE PROCEDURE applicationLockCreator();
    

-- Trigger to create ROUTE when new aplication is added:
--  if special_designation:
--      find director
--      create route: director
--  else:
--      find HOD
--      find dean
--      if restrospective:
--          find director
--          create route: HOD->dean->director
--      else
--          create route: HOD->dean

CREATE TRIGGER createRouteTrigger
AFTER INSERT ON LeaveApplication
FOR EACH ROW EXECUTE PROCEDURE createRoute();



SELECT EID FROM SpecialDesignation 
    WHERE designation = 'HOD' 
    AND type_or_dept IN (SELECT deptName::text FROM Employee WHERE EID = 8);

INSERT INTO LeaveApplication(EID, type, leaveStartDate, leaveEndDate, content)
            Values(10, 'Normal', '2021-04-15 18:52:31.041565+05:30', '2021-05-15 18:52:31.041565+05:30', 'even hi');



CREATE OR REPLACE FUNCTION validateSpecialDesignation()
RETURNS TRIGGER AS $$
    DECLARE countOfSpecialDesig int;
    BEGIN
        IF NEW.startDate > NEW.endDate THEN 
            RAISE EXCEPTION 'Invalid Designation: endDate should be after startDate';
        END IF;
        
        SELECT count(*) FROM SpecialDesignation
            WHERE eid = NEW.eid
            AND endDate > NEW.startDate
            INTO countOfSpecialDesig;

        IF countOfSpecialDesig > 0 THEN 
            RAISE EXCEPTION 'Failed: cannot assign new designation until previous one is terminated!';
        END IF;
        
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validateSpecialDesignationTrigger
BEFORE INSERT ON SpecialDesignation
FOR EACH ROW EXECUTE PROCEDURE validateSpecialDesignation();


INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) VALUES (3, 'Director', 'Director', '2021-04-13 16:59:16.431964+05:30', '3000-04-13 16:59:16.431964+05:30');


SELECT count(*) FROM SpecialDesignation
    WHERE 
        eid = 1
        AND endDate > '2021-04-13 16:59:16.431964+05:30';

INSERT INTO SpecialDesignation(EID, designation, type_or_dept, startDate, endDate) 
VALUES (1, 'HOD', 'CSE', '2021-04-13 16:59:16.431964+05:30', '3000-04-13 16:59:16.431964+05:31');

SELECT count(*) FROM SpecialDesignation
        WHERE
            eid = 1
            AND designation = 'HOD'
            AND type_or_dept = 'CSE'
            AND startDate = '2021-04-13'
            AND endDate = '2021-04-13';

CREATE OR REPLACE FUNCTION testfn(
    OUT duplicates int
) AS $$
    BEGIN
        -- CONSTRAINT: to prevent duplicate inputs
        SELECT count(*) FROM SpecialDesignation
        WHERE
            eid = 1
            AND designation = 'HOD'
            AND type_or_dept = 'CSE'
            AND startDate = '2021-04-13'
            AND endDate = '2021-04-13'
        INTO duplicates;
    END;
$$ LANGUAGE plpgsql;